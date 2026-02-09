import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse } from '../utils/testHelpers';
import * as paymentController from '../../src/controllers/payment.collection.controller';
import * as paymentService from '../../src/services/payment.collection.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/models', () => ({
  default: {
    transaction: vi.fn().mockResolvedValue({
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('../../src/services/payment.collection.service');

vi.mock('../../src/payment/providers', () => ({
  getPaymentProvider: vi.fn().mockReturnValue({
    checkStatus: vi.fn().mockResolvedValue({ success: true, raw: {} }),
    initiatePayment: vi.fn().mockResolvedValue({ redirectUrl: null, footprint: null, raw: {} }),
  }),
}));

describe('payment.collection.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mobilePaymentCollection', () => {
    it('returns 404 and rolls back when getOrderForPayment throws AppError', async () => {
      vi.mocked(paymentService.getOrderForPayment).mockRejectedValue(
        new AppError('Order not found or not created', 404),
      );

      const req = mockRequest<{ orderId: string }, { meanCode: string; amount: number; currency: string }>({
        params: { orderId: 'missing' },
        body: { meanCode: 'CARD', amount: 100, currency: 'XAF' },
      });
      const res = mockResponse();

      await paymentController.mobilePaymentCollection(req as never, res as never);

      expect(paymentService.getOrderForPayment).toHaveBeenCalledWith('missing');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found or not created' });
    });
  });

  describe('collectionResponseAdwa', () => {
    it('returns 200 and result when processAdwaWebhook succeeds', async () => {
      const result = { message: 'Webhook processed' };
      vi.mocked(paymentService.processAdwaWebhook).mockResolvedValue(result);

      const req = mockRequest<object, { footPrint: string; moyenPaiement: string }>({
        body: { footPrint: 'fp1', moyenPaiement: 'CARD' },
      });
      const res = mockResponse();

      await paymentController.collectionResponseAdwa(req as never, res as never);

      expect(paymentService.processAdwaWebhook).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns error status when AppError', async () => {
      vi.mocked(paymentService.processAdwaWebhook).mockRejectedValue(
        new AppError('Invalid footprint', 400),
      );

      const req = mockRequest<object, { footPrint: string; moyenPaiement: string }>({
        body: { footPrint: 'bad', moyenPaiement: 'CARD' },
      });
      const res = mockResponse();

      await paymentController.collectionResponseAdwa(req as never, res as never);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid footprint' });
    });

    it('returns 500 on generic error', async () => {
      vi.mocked(paymentService.processAdwaWebhook).mockRejectedValue(new Error('Network error'));

      const req = mockRequest<object, { footPrint: string; moyenPaiement: string }>({
        body: { footPrint: 'fp1', moyenPaiement: 'CARD' },
      });
      const res = mockResponse();

      await paymentController.collectionResponseAdwa(req as never, res as never);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Network error' });
    });
  });

  describe('confirmExternalPayment', () => {
    it('returns 200 and result when confirm succeeds', async () => {
      const result = { message: 'Confirmed', orderId: 'o1', status: 'processing' };
      vi.mocked(paymentService.confirmExternalPayment).mockResolvedValue(result);

      const req = mockRequest<object, { orderId: string; amount: number; currency: string; externalPaymentId: string }>({
        body: {
          orderId: 'o1',
          amount: 100,
          currency: 'XAF',
          externalPaymentId: 'ext-1',
        },
      });
      const res = mockResponse();

      await paymentController.confirmExternalPayment(req as never, res as never);

      expect(paymentService.confirmExternalPayment).toHaveBeenCalledWith({
        orderId: 'o1',
        amount: 100,
        currency: 'XAF',
        externalPaymentId: 'ext-1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 404 when AppError', async () => {
      vi.mocked(paymentService.confirmExternalPayment).mockRejectedValue(
        new AppError('Order not found', 404),
      );

      const req = mockRequest<object, { orderId: string; amount: number; currency: string; externalPaymentId: string }>({
        body: { orderId: 'missing', amount: 100, currency: 'XAF', externalPaymentId: 'ext-1' },
      });
      const res = mockResponse();

      await paymentController.confirmExternalPayment(req as never, res as never);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  });
});
