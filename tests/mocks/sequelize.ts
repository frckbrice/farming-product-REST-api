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
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
        update: vi.fn().mockRejectedValue(new Error('Database error')),
        destroy: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    Role: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    Product: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
        update: vi.fn().mockRejectedValue(new Error('Database error')),
        destroy: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    Order: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    Transaction: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    BuyerReview: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    },
    Notification: {
        findOne: vi.fn().mockRejectedValue(new Error('Database error')),
        create: vi.fn().mockRejectedValue(new Error('Database error')),
        findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    },
}; 