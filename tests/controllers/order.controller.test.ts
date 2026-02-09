import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as orderController from '../../src/controllers/order.controller';
import * as orderService from '../../src/services/order.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/services/order.service');
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://test.cloudinary.com/image.jpg' }),
    },
  },
}));
vi.mock('fs', () => ({
  unlinkSync: vi.fn(),
}));

describe('order.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('returns 200 and order when found', async () => {
      const order = { id: 'o1', buyerId: 'b1', sellerId: 's1' };
      vi.mocked(orderService.getOrderById).mockResolvedValue(order as never);

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'o1' } });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getOrderById(req as never, res as never, next);

      expect(orderService.getOrderById).toHaveBeenCalledWith('o1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', order });
    });

    it('returns 404 when order not found', async () => {
      vi.mocked(orderService.getOrderById).mockRejectedValue(new AppError('Order not found', 404));

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getOrderById(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  });

  describe('getBuyerOrders', () => {
    it('returns 200 and orders for buyer', async () => {
      const ordersData = { count: 1, rows: [{ id: 'o1', buyerId: 'b1' }] };
      vi.mocked(orderService.getBuyerOrders).mockResolvedValue(ordersData as never);

      const req = mockRequest<{ buyerId: string }, object, { orderStatus?: string }>({
        params: { buyerId: 'b1' },
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getBuyerOrders(req as never, res as never, next);

      expect(orderService.getBuyerOrders).toHaveBeenCalledWith('b1', undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', ordersData });
    });

    it('calls service with orderStatus when provided', async () => {
      vi.mocked(orderService.getBuyerOrders).mockResolvedValue({ count: 0, rows: [] } as never);

      const req = mockRequest<{ buyerId: string }, object, { orderStatus?: string }>({
        params: { buyerId: 'b1' },
        query: { orderStatus: 'pending' },
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getBuyerOrders(req as never, res as never, next);

      expect(orderService.getBuyerOrders).toHaveBeenCalledWith('b1', 'pending');
    });
  });

  describe('getSellerOrders', () => {
    it('returns 200 and orders for seller', async () => {
      const ordersData = { count: 1, rows: [{ id: 'o1', sellerId: 's1' }] };
      vi.mocked(orderService.getSellerOrders).mockResolvedValue(ordersData as never);

      const req = mockRequest<{ sellerId: string }, object, { orderStatus?: string; productName?: string }>({
        params: { sellerId: 's1' },
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getSellerOrders(req as never, res as never, next);

      expect(orderService.getSellerOrders).toHaveBeenCalledWith('s1', undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', ordersData });
    });
  });

  describe('createOrder', () => {
    it('returns 200 and result when order created', async () => {
      const result = { orderId: 'o1', transactionId: 'tx1' };
      vi.mocked(orderService.createOrder).mockResolvedValue(result as never);

      const req = mockRequest<{ productId: string }, { quantity: number }>({
        params: { productId: 'p1' },
        body: { quantity: 2 },
        userData: { UserId: 'buyer-1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.createOrder(req as never, res as never, next);

      expect(orderService.createOrder).toHaveBeenCalledWith('p1', { quantity: 2 }, 'buyer-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 404 when AppError', async () => {
      vi.mocked(orderService.createOrder).mockRejectedValue(new AppError('Product not found', 404));

      const req = mockRequest<{ productId: string }, object>({ params: { productId: 'p1' }, body: {} });
      const res = mockResponse();
      const next = mockNext();

      await orderController.createOrder(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });

  describe('updateOrder', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { message: 'Updated' };
      vi.mocked(orderService.updateOrder).mockResolvedValue(result as never);

      const req = mockRequest<{ orderId: string }, { userId: string }>({
        params: { orderId: 'o1' },
        body: { userId: 'u1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.updateOrder(req as never, res as never, next);

      expect(orderService.updateOrder).toHaveBeenCalledWith('o1', 'u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('getTransaction', () => {
    it('returns 200 and transaction details', async () => {
      const transaction = { id: 'tx1', orderId: 'o1', amount: 100 };
      vi.mocked(orderService.getTransactionByOrderId).mockResolvedValue(transaction as never);

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'o1' } });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getTransaction(req as never, res as never, next);

      expect(orderService.getTransactionByOrderId).toHaveBeenCalledWith('o1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction Details',
        details: transaction,
      });
    });

    it('returns 404 when transaction not found', async () => {
      vi.mocked(orderService.getTransactionByOrderId).mockRejectedValue(new AppError('Transaction not found', 404));

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'o1' } });
      const res = mockResponse();
      const next = mockNext();

      await orderController.getTransaction(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction not found' });
    });
  });

  describe('updateDispatchDetails', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { message: 'Dispatch updated' };
      vi.mocked(orderService.updateDispatchDetails).mockResolvedValue(result as never);

      const req = mockRequest<{ orderId: string }, { method: string; date: string }>({
        params: { orderId: 'o1' },
        body: { method: 'express', date: '2025-01-01' },
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.updateDispatchDetails(req as never, res as never, next);

      expect(orderService.updateDispatchDetails).toHaveBeenCalledWith('o1', {
        method: 'express',
        date: '2025-01-01',
        imageUrl: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 404 when AppError', async () => {
      vi.mocked(orderService.updateDispatchDetails).mockRejectedValue(new AppError('Order not found', 404));

      const req = mockRequest<{ orderId: string }, { method: string; date: string }>({
        params: { orderId: 'o1' },
        body: { method: 'express', date: '2025-01-01' },
      });
      const res = mockResponse();
      const next = mockNext();

      await orderController.updateDispatchDetails(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  });
});
