import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as authService from '../../src/services/auth.service';

const mockCompare = vi.hoisted(() => vi.fn().mockResolvedValue(true));
vi.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: mockCompare,
    hashSync: vi.fn().mockReturnValue('hashed'),
  },
  compare: mockCompare,
  hashSync: vi.fn().mockReturnValue('hashed'),
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.User.findOne.mockResolvedValue(null);
    mockModels.User.create.mockImplementation((data: object) =>
      Promise.resolve({
        ...data,
        id: 'new-user-id',
        email: (data as { email?: string }).email,
      }),
    );
    mockModels.Role.findOne.mockResolvedValue({ id: 'role-id', roleName: 'buyer' });
    mockModels.Role.create.mockResolvedValue({ id: 'role-id', roleName: 'buyer' });
  });

  describe('verifyPhone', () => {
    it('throws AppError for empty email or password', async () => {
      await expect(
        authService.verifyPhone({
          phoneNum: '123',
          password: '',
          country: 'ET',
          email: '',
          userRole: 'buyer',
        }),
      ).rejects.toMatchObject({
        message: 'Empty input fields',
        statusCode: 400,
      });
    });

    it('throws AppError when password too short', async () => {
      await expect(
        authService.verifyPhone({
          phoneNum: '123',
          password: 'short',
          country: 'ET',
          email: 'a@b.com',
          userRole: 'buyer',
        }),
      ).rejects.toMatchObject({
        message: 'Password must be at least 8 characters',
        statusCode: 400,
      });
    });

    it('throws AppError for invalid email', async () => {
      await expect(
        authService.verifyPhone({
          phoneNum: '123',
          password: 'password123',
          country: 'ET',
          email: 'not-an-email',
          userRole: 'buyer',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid email entered',
        statusCode: 400,
      });
    });

    it('throws AppError for invalid role', async () => {
      await expect(
        authService.verifyPhone({
          phoneNum: '123',
          password: 'password123',
          country: 'ET',
          email: 'a@b.com',
          userRole: 'admin',
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Invalid role'),
        statusCode: 400,
      });
    });

    it('throws AppError when email already registered', async () => {
      mockModels.User.findOne.mockResolvedValue({
        id: 'existing',
        email: 'existing@example.com',
      });

      await expect(
        authService.verifyPhone({
          phoneNum: '123',
          password: 'password123',
          country: 'ET',
          email: 'existing@example.com',
          userRole: 'buyer',
        }),
      ).rejects.toMatchObject({
        message: 'This email is already registered.',
        statusCode: 409,
      });
    });
  });

  describe('logIn', () => {
    it('throws AppError when user not found', async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      await expect(
        authService.logIn({ email: 'nobody@test.com', password: 'pass1234' }),
      ).rejects.toMatchObject({
        message: 'No user exists for this email address',
        statusCode: 403,
      });
    });

    it('throws AppError when password incorrect', async () => {
      mockCompare.mockResolvedValueOnce(false);
      mockModels.User.findOne.mockResolvedValue({
        id: '1',
        email: 'u@test.com',
        password: 'hashed',
        firstName: 'F',
        lastName: 'L',
        verifiedUser: true,
        role: { roleName: 'buyer' },
      });

      await expect(
        authService.logIn({ email: 'u@test.com', password: 'wrong' }),
      ).rejects.toMatchObject({
        message: 'Incorrect Password',
        statusCode: 403,
      });
    });
  });

  // --- OTP verification disabled: keeping authentication simple ---
  // describe('verifyOtp', () => {
  //   it('returns login message', async () => {
  //     const result = await authService.verifyOtp({
  //       email: 'u@test.com',
  //       otp: '1234',
  //     });
  //     expect(result.message).toBe(
  //       'Please log in with your email and password.',
  //     );
  //   });
  // });
});
