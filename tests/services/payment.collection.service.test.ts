import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as paymentCollectionService from '../../src/services/payment.collection.service';

vi.mock('../../src/middleware/send-notification', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

vi.mock('../../src/middleware/handleExpoResponse', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('payment.collection.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.Order.findByPk.mockResolvedValue(null);
    mockModels.Order.update.mockResolvedValue([1]);
    mockModels.Transaction.create.mockResolvedValue({ id: 'tx-1' });
  });

  describe('getOrderForPayment', () => {
    it('throws AppError when order not found', async () => {
      mockModels.Order.findByPk.mockResolvedValue(null);

      await expect(
        paymentCollectionService.getOrderForPayment('missing-order-id'),
      ).rejects.toMatchObject({
        message: 'Order not found or not created',
        statusCode: 404,
      });
    });

    it('returns order when found', async () => {
      const order = {
        id: 'o1',
        amount: 100,
        buyerId: 'b1',
        sellerId: 's1',
      };
      mockModels.Order.findByPk.mockResolvedValue(order);

      const result = await paymentCollectionService.getOrderForPayment('o1');
      expect(result).toEqual(order);
    });
  });
});
