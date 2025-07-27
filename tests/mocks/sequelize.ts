import { vi } from 'vitest';

// Mock Sequelize instance
export const mockSequelizeInstance = {
    authenticate: vi.fn().mockResolvedValue(true),
    sync: vi.fn().mockResolvedValue(true),
    define: vi.fn(),
    model: vi.fn(),
    models: {},
    addModels: vi.fn(),
};

// Mock Sequelize constructor
export const MockSequelize = vi.fn(() => mockSequelizeInstance);

// Mock models
export const mockModels = {
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
    Product: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'product-id' })),
        findAll: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue([1]),
        destroy: vi.fn().mockResolvedValue(1),
    },
    Order: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'order-id' })),
        findAll: vi.fn().mockResolvedValue([]),
    },
    Transaction: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'transaction-id' })),
        findAll: vi.fn().mockResolvedValue([]),
    },
    BuyerReview: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'review-id' })),
        findAll: vi.fn().mockResolvedValue([]),
    },
    Notification: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'notification-id' })),
        findAll: vi.fn().mockResolvedValue([]),
    },
    UserOTPCode: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({
            id: 'otp-id',
            otp: data.otp,
            userId: data.userId,
            expiredAt: new Date(Date.now() + 10 * 60 * 1000),
        })),
        destroy: vi.fn().mockResolvedValue(1),
    },
};

// Mock individual model files
vi.mock('../../src/models/user', () => ({
    __esModule: true,
    default: mockModels.User,
}));

vi.mock('../../src/models/role', () => ({
    __esModule: true,
    default: mockModels.Role,
}));

vi.mock('../../src/models/userotpcode', () => ({
    __esModule: true,
    default: mockModels.UserOTPCode,
}));

// Mock cloudinary
vi.mock('cloudinary', () => ({
    __esModule: true,
    v2: {
        config: vi.fn(),
        uploader: {
            upload: vi.fn().mockResolvedValue({ secure_url: 'https://test.cloudinary.com/image.jpg' }),
        },
    },
}));

// Mock google-auth-library
vi.mock('google-auth-library', () => ({
    __esModule: true,
    OAuth2Client: vi.fn().mockImplementation(() => ({
        verifyIdToken: vi.fn().mockResolvedValue({
            getPayload: () => ({
                sub: 'test-id',
                email: 'test@example.com',
                given_name: 'Test',
                family_name: 'User',
                picture: 'https://test.example.com/image.jpg',
            }),
        }),
    })),
}));

// Mock axios
vi.mock('axios', () => ({
    __esModule: true,
    default: {
        request: vi.fn().mockResolvedValue(true),
    },
})); 