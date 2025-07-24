import { vi } from 'vitest';

export const mockPaymentController = {
    mobilePaymentCollection: vi.fn().mockImplementation((req, res) => {
        res.status(200).json({ message: 'Payment initiated' });
    }),
    collectionResponseAdwa: vi.fn().mockImplementation((req, res) => {
        res.status(200).json({ message: 'Payment processed successfully' });
    }),
};

// Mock the entire payment collection controller
vi.mock('../../src/controllers/payment.collection.controller', () => ({
    mobilePaymentCollection: mockPaymentController.mobilePaymentCollection,
    collectionResponseAdwa: mockPaymentController.collectionResponseAdwa,
})); 