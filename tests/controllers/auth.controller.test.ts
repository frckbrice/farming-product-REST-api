import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import request from 'supertest';
import '../setup';
import { MockSequelize, mockModels } from '../mocks/sequelize';
import '../mocks/payment';
import { createTestUser } from '../utils/testHelpers';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Sequelize
vi.mock('sequelize-typescript', async () => {
  const actual = await vi.importActual('sequelize-typescript');
  return {
    ...actual,
    Sequelize: MockSequelize,
  };
});

// Minimal nodemailer mock matching import usage
vi.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: () => ({
      sendMail: () => Promise.resolve({ messageId: 'test-message-id' }),
    }),
  },
}));

// Mock environment variables
beforeAll(() => {
  process.env.FARMING_PRODUCTS_PROVIDER = 'test';
  process.env.FARMING_PRODUCTS_HOST = 'smtp.test.com';
  process.env.GMAIL_USER = 'test@test.com';
  process.env.GMAIL_APP_PASSWORD = 'test_pass';
  process.env.GMAIL_AUTH_CLIENTID = 'test_google_client_id';
  process.env.FARMING_PRODUCTS_SMS_USER = 'test_sms_user';
  process.env.FARMING_PRODUCTS_SMS_PASSWORD = 'test_sms_pass';
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_SECRET_REFRESH = 'test_refresh_secret';
});

// Mock axios for SMS
vi.mock('axios', () => ({
  default: {
    request: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hashSync: vi.fn().mockReturnValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
}));

// Mock cloudinary (always return secure_url for uploads)
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockImplementation(() => Promise.resolve({ secure_url: 'https://test.cloudinary.com/image.jpg' })),
    },
  },
}));

// Mock jwt (include JsonWebTokenError so controller's instanceof check works)
vi.mock('jsonwebtoken', () => {
  const sign = vi.fn()
    .mockReturnValueOnce('test_token')
    .mockReturnValueOnce('test_refresh_token');
  class JsonWebTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  }
  return {
    __esModule: true,
    default: {
      sign,
      verify: vi.fn().mockReturnValue({ id: 'test_id', UserId: 'test-id', email: 'test@example.com', exp: Math.floor(Date.now() / 1000) + 3600 }),
      JsonWebTokenError,
    },
    sign,
    verify: vi.fn().mockReturnValue({ id: 'test_id', UserId: 'test-id', email: 'test@example.com', exp: Math.floor(Date.now() / 1000) + 3600 }),
    JsonWebTokenError,
  };
});

// Mock google-auth-library
vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    verifyIdToken: vi.fn().mockResolvedValue({
      getPayload: () => ({
        sub: 'test_id',
        email: 'test@test.com',
        given_name: 'Test',
        family_name: 'User',
        picture: 'test_url',
      }),
    }),
  })),
}));

// Mock models
vi.mock('../../src/models', () => ({
  default: {
    sequelize: {
      authenticate: vi.fn().mockResolvedValue(true),
      sync: vi.fn().mockResolvedValue(true),
    },
    User: {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data) => Promise.resolve({
        id: 'test-id',
        email: data.email,
        password: data.password,
        role: {
          roleName: 'buyer',
        },
        firstName: 'Test',
        lastName: 'User',
        verifiedUser: true,
      })),
      findAll: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue([1]),
      destroy: vi.fn().mockResolvedValue(1),
    },
    Role: {
      findOne: vi.fn().mockResolvedValue({ id: 'role-id', roleName: 'buyer' }),
      create: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'role-id', roleName: data.roleName })),
      findAll: vi.fn().mockResolvedValue([]),
    },
    // OTP auth disabled — keeping authentication simple; mock kept for model loading.
    UserOTPCode: {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((data: { otp?: string; userId?: string }) => Promise.resolve({
        id: 'otp-id',
        otp: data.otp,
        userId: data.userId,
        expiredAt: new Date(Date.now() + 10 * 60 * 1000),
      })),
      destroy: vi.fn().mockResolvedValue(1),
    },
  },
}));

// Import app after mocking
import app from '../../app';
import * as authService from '../../src/services/auth.service';

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure nodemailer mocks are properly configured
    // The mockCreateTransport and mockSendMail are now defined inside the mock factory
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/v2/auth/signup', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Empty input fields');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          userRole: 'buyer',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Password must be at least 8 characters');
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          userRole: 'buyer',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'Invalid email entered');
    });

    it('should return 400 if role is invalid', async () => {
      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          userRole: 'invalid-role',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toContain('Invalid role');
    });

    it('should return 409 if email is already registered', async () => {
      // Mock User.findOne to return a user
      mockModels.User.findOne.mockResolvedValueOnce(createTestUser());

      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          userRole: 'buyer',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'This email is already registered.');
    });

    it('should create user on successful signup', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      mockModels.User.findOne.mockResolvedValueOnce(null);

      // Mock Role.findOne to return a role
      mockModels.Role.findOne.mockResolvedValueOnce({ id: 'role-id' });

      // Mock User.create to return a new user
      const newUser = createTestUser();
      mockModels.User.create.mockResolvedValueOnce(newUser);

      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          userRole: 'buyer',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Registration successful. Complete your profile or log in with your email and password.',
      );
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('userID', newUser.id);
    }, 10000);

    it('should return 500 if database error occurs', async () => {
      // Mock User.findOne to throw an error
      mockModels.User.findOne.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/v2/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          userRole: 'buyer',
          phoneNum: '1234567890',
          country: 'US',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });
  });

  // --- OTP verification disabled: keeping authentication simple ---
  // describe('POST /api/v2/auth/verifyOTP', () => {
  //   it('should return 200 and message to log in with email and password', async () => {
  //     const response = await request(app)
  //       .post('/api/v2/auth/verifyOTP')
  //       .send({
  //         email: 'test@example.com',
  //         otp: '1234',
  //       });
  //
  //     expect(response.status).toBe(200);
  //     expect(response.body).toHaveProperty(
  //       'message',
  //       'Please log in with your email and password.',
  //     );
  //   });
  // });

  describe('POST /api/v2/auth/login', () => {
    it('should return 403 if user does not exist', async () => {
      mockModels.User.findOne.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'No user exists for this email address');
    });

    it('should return 403 if password is incorrect', async () => {
      mockModels.User.findOne.mockResolvedValueOnce(createTestUser());
      const { compare } = await import('bcryptjs');
      (compare as any).mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Incorrect Password');
    });

    it('should login successfully and return tokens', async () => {
      const testUser = createTestUser();
      mockModels.User.findOne.mockResolvedValueOnce({
        ...testUser,
        role: { roleName: 'buyer' },
      });
      const { compare } = await import('bcryptjs');
      (compare as any).mockResolvedValueOnce(true);
      const { sign } = await import('jsonwebtoken');
      (sign as any)
        .mockReturnValueOnce('test_token')
        .mockReturnValueOnce('test_refresh_token');

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Authentication Successful');
      expect(response.body).toHaveProperty('token', 'test_token');
      expect(response.body).toHaveProperty('refreshToken', 'test_refresh_token');
      expect(response.body).toHaveProperty('userData');
      expect(response.body.userData).toHaveProperty('id', testUser.id);
      expect(response.body.userData).toHaveProperty('email', testUser.email);
      expect(response.body.userData).toHaveProperty('role', 'buyer');
    });

    it('should return 500 if database error occurs', async () => {
      mockModels.User.findOne.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/v2/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message', 'An unexpected error occurred');
    });
  });

  describe('POST /api/v2/auth/refreshToken', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .post('/api/v2/auth/refreshToken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        'message',
        'You are either not logged in or your session has expired',
      );
    });

    it('should return 200 and new access token when refresh token is valid', async () => {
      const { generateTestRefreshToken } = await import('../utils/testHelpers');
      const refreshTokenValue = generateTestRefreshToken(
        { id: 'test-id', email: 'test@example.com' },
        '7d',
      );
      const jwt = await import('jsonwebtoken');
      (jwt.default.verify as ReturnType<typeof vi.fn>).mockReturnValue({
        UserId: 'test-id',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      (jwt.default.sign as ReturnType<typeof vi.fn>).mockReturnValue('new_access_token');

      const response = await request(app)
        .post('/api/v2/auth/refreshToken')
        .set('Authorization', `Bearer ${refreshTokenValue}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
      expect(response.body).toHaveProperty('token', 'new_access_token');
    });
  });

  // --- OTP send disabled: keeping authentication simple ---
  // describe('POST /api/v2/auth/sendOTP/', () => {
  //   it('should return 200 and message to use email and password', async () => {
  //     const response = await request(app)
  //       .post('/api/v2/auth/sendOTP/')
  //       .send({ email: 'test@example.com' });
  //
  //     expect(response.status).toBe(200);
  //     expect(response.body).toHaveProperty(
  //       'message',
  //       'Use your email and password to log in.',
  //     );
  //   });
  // });

  describe('POST /api/v2/auth/signup/oAuth', () => {
    it('should return 400 when no google or facebook token provided', async () => {
      const response = await request(app)
        .post('/api/v2/auth/signup/oAuth')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing authentication token');
    });

    it('should return 200 and token when authHandler succeeds', async () => {
      vi.spyOn(authService, 'authHandler').mockResolvedValueOnce({
        message: 'User logged in successfully',
        token: 'oauth_token',
        user: createTestUser({ id: 'oauth-user-id', email: 'test@example.com' }) as any,
      });

      const response = await request(app)
        .post('/api/v2/auth/signup/oAuth')
        .send({ googleToken: 'valid_google_id_token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User logged in successfully');
      expect(response.body).toHaveProperty('token', 'oauth_token');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('PUT /api/v2/auth/signup/:userId', () => {
    it('should return 200 and success message on user registration', async () => {
      // Use authService spy so controller gets mock response (avoids cloudinary in this path)
      vi.spyOn(authService, 'registerUser').mockResolvedValueOnce({
        message: 'User successfully registered',
      });
      // Mock cloudinary.uploader.upload for the controller's upload path (controller runs upload before service)
      const cloudinary = await import('cloudinary');
      vi.mocked(cloudinary.v2.uploader.upload).mockResolvedValueOnce({
        secure_url: 'https://test.cloudinary.com/image.jpg',
      } as any);

      const response = await request(app)
        .put('/api/v2/auth/signup/test-user-id')
        .set('Content-Type', 'application/json')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'User successfully registered',
      );
      expect(authService.registerUser).toHaveBeenCalledWith('test-user-id', expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
      }));
    });
  });
});
