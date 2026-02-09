import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as productSearchController from '../../src/controllers/product.search.controller';
import * as productSearchService from '../../src/services/product.search.service';
import { AppError } from '../../src/errors';

vi.mock('../../src/services/product.search.service');

describe('product.search.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProductSearch', () => {
    it('returns 200 and queryResult when results found', async () => {
      const queryResult = { count: 2, rows: [{ id: '1', productName: 'P1' }, { id: '2', productName: 'P2' }] };
      vi.mocked(productSearchService.searchProducts).mockResolvedValue(queryResult as never);

      const req = mockRequest<object, object, { q?: string }>({ query: { q: 'tomato' } });
      const res = mockResponse();
      const next = mockNext();

      await productSearchController.getAllProductSearch(req as never, res as never, next);

      expect(productSearchService.searchProducts).toHaveBeenCalledWith({ q: 'tomato' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ queryResult });
    });

    it('returns 200 with message when no products found', async () => {
      const queryResult = { count: 0, rows: [] };
      vi.mocked(productSearchService.searchProducts).mockResolvedValue(queryResult as never);

      const req = mockRequest<object, object, object>({ query: {} });
      const res = mockResponse();
      const next = mockNext();

      await productSearchController.getAllProductSearch(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No products found matching the search criteria',
        queryResult,
      });
    });

    it('returns 400 when AppError (invalid page)', async () => {
      vi.mocked(productSearchService.searchProducts).mockRejectedValue(
        new AppError('Invalid page number', 400),
      );

      const req = mockRequest<object, object, { page?: string }>({ query: { page: '0' } });
      const res = mockResponse();
      const next = mockNext();

      await productSearchController.getAllProductSearch(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid page number' });
    });

    it('returns 500 on generic error', async () => {
      vi.mocked(productSearchService.searchProducts).mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await productSearchController.getAllProductSearch(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });
});
