import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as productSearchService from '../../src/services/product.search.service';

describe('product.search.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.Product.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
  });

  describe('searchProducts', () => {
    it('throws AppError for invalid page number', async () => {
      await expect(
        productSearchService.searchProducts({ page: '0' }),
      ).rejects.toMatchObject({
        message: 'Invalid page number',
        statusCode: 400,
      });

      await expect(
        productSearchService.searchProducts({ page: 'abc' }),
      ).rejects.toMatchObject({
        message: 'Invalid page number',
        statusCode: 400,
      });
    });

    it('throws AppError for invalid limit', async () => {
      await expect(
        productSearchService.searchProducts({ limit: '0' }),
      ).rejects.toMatchObject({
        message: 'Invalid limit value. Must be between 1 and 100',
        statusCode: 400,
      });

      await expect(
        productSearchService.searchProducts({ limit: '101' }),
      ).rejects.toMatchObject({
        message: 'Invalid limit value. Must be between 1 and 100',
        statusCode: 400,
      });
    });

    it('throws AppError for invalid price range', async () => {
      await expect(
        productSearchService.searchProducts({
          minPrice: 'x',
          maxPrice: 'y',
        }),
      ).rejects.toMatchObject({
        message: 'Invalid price range values',
        statusCode: 400,
      });
    });

    it('throws AppError when min price > max price', async () => {
      await expect(
        productSearchService.searchProducts({
          minPrice: '100',
          maxPrice: '50',
        }),
      ).rejects.toMatchObject({
        message: 'Minimum price cannot be greater than maximum price',
        statusCode: 400,
      });
    });

    it('throws AppError for invalid productRating', async () => {
      await expect(
        productSearchService.searchProducts({ productRating: '0' }),
      ).rejects.toMatchObject({
        message: 'Invalid rating value. Must be between 1 and 5',
        statusCode: 400,
      });
    });

    it('returns count and rows on valid query', async () => {
      const rows = [{ id: '1', productName: 'P1' }];
      mockModels.Product.findAndCountAll.mockResolvedValue({ count: 1, rows });

      const result = await productSearchService.searchProducts({
        page: '1',
        limit: '10',
      });
      expect(result.count).toBe(1);
      expect(result.rows).toEqual(rows);
    });
  });
});
