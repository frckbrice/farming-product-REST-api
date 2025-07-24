import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import '../setup';
import { MockSequelize, mockModels } from '../mocks/sequelize';
import '../mocks/payment';

// Mock Sequelize
vi.mock('sequelize-typescript', async () => {
    const actual = await vi.importActual('sequelize-typescript');
    return {
        ...actual,
        Sequelize: MockSequelize,
    };
});

// Mock database models
vi.mock('../../src/models', () => ({
    default: {
        sequelize: {
            authenticate: vi.fn().mockResolvedValue(true),
            sync: vi.fn().mockResolvedValue(true),
        },
        ...mockModels,
    },
}));

// Import app after mocking
import app from '../../app';

describe('Auth Controller', () => {
    describe('POST /api/v1/auth/signup', () => {
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'fail');
            expect(response.body).toHaveProperty('message', 'Empty input fields');
        });

        it('should return 500 if database error occurs', async () => {
          // Mock User.create to throw an error for this specific test
          mockModels.User.create.mockRejectedValueOnce(new Error('Database error'));

          const response = await request(app)
              .post('/api/v1/auth/signup')
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

    describe('POST /api/v1/auth/login', () => {
        it('should return 500 if database error occurs', async () => {
            // Mock User.findOne to throw an error for this specific test
            mockModels.User.findOne.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('status', 'fail');
            expect(response.body).toHaveProperty('message');
        });
    });
}); 