import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as orderService from '../../src/services/order.service';

vi.mock('../../src/middleware/send-notification', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

vi.mock('../../src/middleware/handleExpoResponse', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('order.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.Order.findOne.mockResolvedValue(null);
    mockModels.Order.findByPk.mockResolvedValue(null);
    mockModels.Order.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    mockModels.Order.create.mockResolvedValue({ id: 'order-1' });
    mockModels.Transaction.create.mockResolvedValue({ id: 'tx-1' });
  });

  describe('getOrderById', () => {
    it('throws AppError when order not found', async () => {
      mockModels.Order.findOne.mockResolvedValue(null);

      await expect(orderService.getOrderById('missing')).rejects.toMatchObject({
        message: 'Order not found',
        statusCode: 404,
      });
    });

    it('returns order when found', async () => {
      const order = { id: 'o1', buyerId: 'b1', sellerId: 's1' };
      mockModels.Order.findOne.mockResolvedValue(order);

      const result = await orderService.getOrderById('o1');
      expect(result).toEqual(order);
    });
  });

  describe('getBuyerOrders', () => {
    it('returns findAndCountAll result', async () => {
      const rows = [{ id: 'o1', buyerId: 'b1' }];
      mockModels.Order.findAndCountAll.mockResolvedValue({ count: 1, rows });

      const result = await orderService.getBuyerOrders('b1');
      expect(result.count).toBe(1);
      expect(result.rows).toEqual(rows);
    });
  });
});
