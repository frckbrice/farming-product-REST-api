import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as reviewService from '../../src/services/review.service';

vi.mock('../../src/middleware/send-notification', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

vi.mock('../../src/middleware/handleExpoResponse', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('review.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.BuyerReview.findOne.mockResolvedValue(null);
    mockModels.BuyerReview.findByPk.mockResolvedValue(null);
    mockModels.BuyerReview.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });
    mockModels.BuyerReview.create.mockResolvedValue({ id: 'review-1' });
    mockModels.BuyerReview.update.mockResolvedValue([1]);
    mockModels.BuyerReview.destroy.mockResolvedValue(1);
    mockModels.Order.findOne.mockResolvedValue(null);
    mockModels.Order.update.mockResolvedValue([1]);
    mockModels.User.findByPk.mockResolvedValue(null);
  });

  describe('getReviewByOrderId', () => {
    it('throws AppError when review not found', async () => {
      mockModels.BuyerReview.findOne.mockResolvedValue(null);

      await expect(
        reviewService.getReviewByOrderId('order-1'),
      ).rejects.toMatchObject({
        message: 'Review not found for this order',
        statusCode: 404,
      });
    });

    it('returns review when found', async () => {
      const review = { id: 'r1', orderId: 'order-1', rating: 5 };
      mockModels.BuyerReview.findOne.mockResolvedValue(review);

      const result = await reviewService.getReviewByOrderId('order-1');
      expect(result).toEqual(review);
    });
  });

  describe('getReviewsByProductId', () => {
    it('throws AppError for invalid rating value', async () => {
      await expect(
        reviewService.getReviewsByProductId('prod-1', '0'),
      ).rejects.toMatchObject({
        message: 'Invalid rating value. Must be between 1 and 5',
        statusCode: 400,
      });

      await expect(
        reviewService.getReviewsByProductId('prod-1', '10'),
      ).rejects.toMatchObject({
        message: 'Invalid rating value. Must be between 1 and 5',
        statusCode: 400,
      });
    });
  });

  describe('createReview', () => {
    it('throws AppError when rating out of range', async () => {
      await expect(
        reviewService.createReview('p1', 'o1', 'u1', {
          rating: 0,
          comment: 'Good',
        }),
      ).rejects.toMatchObject({
        message: 'Rating must be between 1 and 5',
        statusCode: 400,
      });
    });

    it('throws AppError when comment empty', async () => {
      await expect(
        reviewService.createReview('p1', 'o1', 'u1', {
          rating: 5,
          comment: '   ',
        }),
      ).rejects.toMatchObject({
        message: 'Comment is required',
        statusCode: 400,
      });
    });

    it('throws AppError when order not found', async () => {
      mockModels.Order.findOne.mockResolvedValue(null);

      await expect(
        reviewService.createReview('p1', 'o1', 'u1', {
          rating: 5,
          comment: 'Great',
        }),
      ).rejects.toMatchObject({
        message: 'Order not found',
        statusCode: 404,
      });
    });

    it('throws AppError when order not delivered', async () => {
      mockModels.Order.findOne.mockResolvedValue({
        id: 'o1',
        status: 'pending',
        sellerId: 's1',
      });

      await expect(
        reviewService.createReview('p1', 'o1', 'u1', {
          rating: 5,
          comment: 'Great',
        }),
      ).rejects.toMatchObject({
        message: expect.stringContaining('still in processing'),
        statusCode: 401,
      });
    });
  });

  describe('updateReview', () => {
    it('throws AppError when rating out of range', async () => {
      await expect(
        reviewService.updateReview('r1', { rating: 6 }),
      ).rejects.toMatchObject({
        message: 'Rating must be between 1 and 5',
        statusCode: 400,
      });
    });

    it('throws AppError when review not found', async () => {
      mockModels.BuyerReview.findByPk.mockResolvedValue(null);

      await expect(
        reviewService.updateReview('missing', { comment: 'Updated' }),
      ).rejects.toMatchObject({
        message: 'Review not found',
        statusCode: 404,
      });
    });
  });

  describe('deleteReview', () => {
    it('throws AppError when review not found', async () => {
      mockModels.BuyerReview.findOne.mockResolvedValue(null);

      await expect(
        reviewService.deleteReview('missing', 'user-1'),
      ).rejects.toMatchObject({
        message: 'Review not found',
        statusCode: 404,
      });
    });

    it('throws AppError when user not authorized', async () => {
      mockModels.BuyerReview.findOne.mockResolvedValue({
        id: 'r1',
        userId: 'other-user',
      });

      await expect(
        reviewService.deleteReview('r1', 'user-1'),
      ).rejects.toMatchObject({
        message: 'You are not authorized to delete this review',
        statusCode: 403,
      });
    });
  });
});
