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
        findByPk: vi.fn().mockResolvedValue(null),
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
        findByPk: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'product-id' })),
        findAll: vi.fn().mockResolvedValue([]),
        findAndCountAll: vi.fn().mockResolvedValue({ count: 0, rows: [] }),
        update: vi.fn().mockResolvedValue([1]),
        destroy: vi.fn().mockResolvedValue(1),
    },
    Order: {
        findOne: vi.fn().mockResolvedValue(null),
        findByPk: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'order-id' })),
        findAll: vi.fn().mockResolvedValue([]),
        findAndCountAll: vi.fn().mockResolvedValue({ count: 0, rows: [] }),
        update: vi.fn().mockResolvedValue([1]),
    },
    Transaction: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'transaction-id' })),
        findAll: vi.fn().mockResolvedValue([]),
    },
    BuyerReview: {
        findOne: vi.fn().mockResolvedValue(null),
        findByPk: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'review-id' })),
        findAll: vi.fn().mockResolvedValue([]),
        findAndCountAll: vi.fn().mockResolvedValue({ count: 0, rows: [] }),
        update: vi.fn().mockResolvedValue([1]),
        destroy: vi.fn().mockResolvedValue(1),
    },
    Notification: {
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'notification-id' })),
        findAll: vi.fn().mockResolvedValue([]),
        findAndCountAll: vi.fn().mockResolvedValue({ count: 0, rows: [] }),
        update: vi.fn().mockResolvedValue([1]),
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

vi.mock('../../src/models/product', () => ({
    __esModule: true,
    default: mockModels.Product,
}));

vi.mock('../../src/models/order', () => ({
    __esModule: true,
    default: mockModels.Order,
}));

vi.mock('../../src/models/transaction', () => ({
    __esModule: true,
    default: mockModels.Transaction,
}));

vi.mock('../../src/models/buyerreview', () => ({
    __esModule: true,
    default: mockModels.BuyerReview,
}));

vi.mock('../../src/models/notifiation', () => ({
    __esModule: true,
    default: mockModels.Notification,
}));

// Prevent models/index from loading real Sequelize and model files (which triggers sequelize-typescript)
vi.mock('../../src/models', () => ({
    __esModule: true,
    default: mockSequelizeInstance,
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