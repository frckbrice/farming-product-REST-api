import { beforeAll, beforeEach, vi } from 'vitest';
import { mockModels } from './mocks/sequelize';
import { hashSync } from 'bcryptjs';

beforeAll(() => {
    // Database Configuration
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.DB_NAME = 'test_db';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test_db';

    // JWT Configuration
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_SECRET_REFRESH = 'test_refresh_secret';

    // Payment Configuration
    process.env.ADWA_MERCHANT_KEY = 'test_merchant_key';
    process.env.ADWA_APPLICATION_KEY = 'test_app_key';
    process.env.ADWA_SUBSCRIPTION_KEY = 'test_subscription_key';
    process.env.ADWA_BASE_URL = 'https://test.adwa.com';
    process.env.MTN_MOMO_SUBSC_KEY = 'test_momo_key';
    process.env.MTN_MOMO_BASE_URL = 'https://test.mtn.com';

    // Cloudinary Configuration
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_api_key';
    process.env.CLOUDINARY_API_SECRET = 'test_api_secret';

    // Email Configuration
    process.env.BREVO_API_KEY = 'test_brevo_key';
    process.env.PROJECT_EMAIL_HOST = 'smtp.test.com';
    process.env.PROJECT_EMAIL_PROVIDER = 'test';
    process.env.EMAIL_PASS = 'test_pass';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.FARMING_PRODUCTS_PROVIDER = 'test';
    process.env.FARMING_PRODUCTS_HOST = 'smtp.test.com';
    process.env.GMAIL_USER = 'test@test.com';
    process.env.GMAIL_APP_PASSWORD = 'test_pass';
});

beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Set default mock implementations
    mockModels.User.findOne.mockImplementation(async ({ where }) => {
        if (where.email === 'existing@example.com') {
            const user = {
                id: 'test-id',
                email: 'existing@example.com',
                password: hashSync('password123', 10),
                verifiedUser: true,
                toJSON: () => ({
                    id: 'test-id',
                    email: 'existing@example.com',
                    verifiedUser: true,
                }),
            };
            return Promise.resolve(user);
        }
        return Promise.resolve(null);
    });

    mockModels.User.create.mockImplementation(async (data) => {
        const user = {
            ...data,
            id: 'test-id',
            verifiedUser: false,
            toJSON: () => ({
                id: 'test-id',
                email: data.email,
                verifiedUser: false,
            }),
        };
        return Promise.resolve(user);
    });

    mockModels.Role.findOne.mockImplementation(async ({ where }) => {
        if (where.roleName === 'buyer' || where.roleName === 'farmer') {
            return Promise.resolve({ id: 'role-id', roleName: where.roleName });
        }
        return Promise.resolve(null);
    });

    mockModels.UserOTPCode.findOne.mockImplementation(async ({ where }) => {
        if (where.userId === 'test-id') {
            return Promise.resolve({
                id: 'otp-id',
                userId: 'test-id',
                otp: hashSync('1234', 10),
                expiredAt: new Date(Date.now() + 10 * 60 * 1000),
            });
        }
        return Promise.resolve(null);
    });

    mockModels.UserOTPCode.create.mockImplementation(async (data) => {
        return Promise.resolve({
            ...data,
            id: 'otp-id',
            expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        });
    });
}); 