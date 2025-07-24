import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import './setup';
import { MockSequelize, mockModels } from './mocks/sequelize';
import './mocks/payment';

// Mock Sequelize
vi.mock('sequelize-typescript', async () => {
    const actual = await vi.importActual('sequelize-typescript');
    return {
        ...actual,
        Sequelize: MockSequelize,
    };
});

// Mock database models
vi.mock('../src/models', () => ({
    default: {
        sequelize: {
            authenticate: vi.fn().mockResolvedValue(true),
            sync: vi.fn().mockResolvedValue(true),
        },
        ...mockModels,
    },
}));

// Import app after mocking
import app from '../app';

describe('API Tests', () => {
    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    it('should return 404 for unknown routes', async () => {
        const response = await request(app).get('/non-existent-route');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('status', 'fail');
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Not Found - /non-existent-route');
    });
}); 