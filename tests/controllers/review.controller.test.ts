import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as reviewController from '../../src/controllers/review.controller';
import * as reviewService from '../../src/services/review.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/services/review.service');

describe('review.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('orderReview', () => {
    it('returns 200 and orderReviewData when found', async () => {
      const orderReviewData = { id: 'r1', orderId: 'o1', rating: 5, comment: 'Great' };
      vi.mocked(reviewService.getReviewByOrderId).mockResolvedValue(orderReviewData as never);

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'o1' } });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.orderReview(req as never, res as never, next);

      expect(reviewService.getReviewByOrderId).toHaveBeenCalledWith('o1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        orderReviewData,
      });
    });

    it('returns 404 when review not found', async () => {
      vi.mocked(reviewService.getReviewByOrderId).mockRejectedValue(
        new AppError('Review not found for this order', 404),
      );

      const req = mockRequest<{ orderId: string }>({ params: { orderId: 'o1' } });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.orderReview(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Review not found for this order' });
    });
  });

  describe('getReviewByProdId', () => {
    it('returns 200 and reviews when count > 0', async () => {
      const reviews = { count: 1, rows: [{ id: 'r1', rating: 5 }] };
      vi.mocked(reviewService.getReviewsByProductId).mockResolvedValue(reviews as never);

      const req = mockRequest<{ productId: string }, object, { rating?: string }>({
        params: { productId: 'p1' },
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.getReviewByProdId(req as never, res as never, next);

      expect(reviewService.getReviewsByProductId).toHaveBeenCalledWith('p1', undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reviews });
    });

    it('returns 200 with message when no reviews', async () => {
      const reviews = { count: 0, rows: [] };
      vi.mocked(reviewService.getReviewsByProductId).mockResolvedValue(reviews as never);

      const req = mockRequest<{ productId: string }, object, { rating?: string }>({
        params: { productId: 'p1' },
        query: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.getReviewByProdId(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No reviews found for this product',
        reviews,
      });
    });

    it('returns 400 when AppError', async () => {
      vi.mocked(reviewService.getReviewsByProductId).mockRejectedValue(
        new AppError('Invalid rating value. Must be between 1 and 5', 400),
      );

      const req = mockRequest<{ productId: string }, object, { rating?: string }>({
        params: { productId: 'p1' },
        query: { rating: '0' },
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.getReviewByProdId(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid rating value. Must be between 1 and 5',
      });
    });
  });

  describe('createReview', () => {
    it('returns 201 and result when created', async () => {
      const result = { id: 'r1', productId: 'p1', orderId: 'o1', rating: 5 };
      vi.mocked(reviewService.createReview).mockResolvedValue(result as never);

      const req = mockRequest<
        { productId: string; orderId: string },
        { rating: number; comment: string }
      >({
        params: { productId: 'p1', orderId: 'o1' },
        body: { rating: 5, comment: 'Great' },
        userData: { UserId: 'user-1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.createReview(req as never, res as never, next);

      expect(reviewService.createReview).toHaveBeenCalledWith('p1', 'o1', 'user-1', {
        rating: 5,
        comment: 'Great',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 401 when userData is missing', async () => {
      const req = mockRequest<{ productId: string; orderId: string }, object>({
        params: { productId: 'p1', orderId: 'o1' },
        body: {},
        userData: undefined,
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.createReview(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid authentication token' });
      expect(reviewService.createReview).not.toHaveBeenCalled();
    });
  });

  describe('updateReview', () => {
    it('returns 200 and result when update succeeds', async () => {
      const result = { id: 'r1', rating: 4, comment: 'Updated' };
      vi.mocked(reviewService.updateReview).mockResolvedValue(result as never);

      const req = mockRequest<{ reviewId: string }, { rating: number; comment: string }>({
        params: { reviewId: 'r1' },
        body: { rating: 4, comment: 'Updated' },
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.updateReview(req as never, res as never, next);

      expect(reviewService.updateReview).toHaveBeenCalledWith('r1', { rating: 4, comment: 'Updated' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('returns 404 when review not found', async () => {
      vi.mocked(reviewService.updateReview).mockRejectedValue(new AppError('Review not found', 404));

      const req = mockRequest<{ reviewId: string }, object>({
        params: { reviewId: 'missing' },
        body: {},
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.updateReview(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Review not found' });
    });
  });

  describe('deleteOwnReview', () => {
    it('returns 204 when delete succeeds', async () => {
      vi.mocked(reviewService.deleteReview).mockResolvedValue(undefined as never);

      const req = mockRequest<object, object>({
        params: { reviewId: 'r1' },
        userData: { UserId: 'user-1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.deleteOwnReview(req as never, res as never, next);

      expect(reviewService.deleteReview).toHaveBeenCalledWith('r1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 401 when userData is missing', async () => {
      const req = mockRequest<{ reviewId: string }>({
        params: { reviewId: 'r1' },
        userData: undefined,
      });
      const res = mockResponse();
      const next = mockNext();

      await reviewController.deleteOwnReview(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid authentication token' });
      expect(reviewService.deleteReview).not.toHaveBeenCalled();
    });
  });
});
