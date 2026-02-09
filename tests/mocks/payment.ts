import { vi } from 'vitest';

export const mockPaymentController = {
    mobilePaymentCollection: vi.fn().mockImplementation((req, res) => {
        res.status(200).json({ message: 'Payment initiated' });
    }),
    collectionResponseAdwa: vi.fn().mockImplementation((req, res) => {
        res.status(200).json({ message: 'Payment processed successfully' });
    }),
    confirmExternalPayment: vi.fn().mockImplementation((req, res) => {
        res.status(200).json({
            message: 'Payment confirmed successfully',
            orderId: req.body?.orderId,
            status: 'processing',
        });
    }),
};

// Mock the entire payment collection controller
vi.mock('../../src/controllers/payment.collection.controller', () => ({
    mobilePaymentCollection: mockPaymentController.mobilePaymentCollection,
    collectionResponseAdwa: mockPaymentController.collectionResponseAdwa,
    confirmExternalPayment: mockPaymentController.confirmExternalPayment,
})); 