import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

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
}); 