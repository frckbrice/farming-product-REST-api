import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';
import * as productController from '../../src/controllers/product.controller';
import * as productService from '../../src/services/product.service';
import { AppError } from '../../src/errors';
import type Product from '../../src/models/product';

vi.mock('../../src/services/product.service');
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

describe('product.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allProducts', () => {
    it('returns 200 and products when service succeeds', async () => {
      const data = { count: 1, rows: [{ id: '1', productName: 'P1' }] as Product[] };
      vi.mocked(productService.findAllProducts).mockResolvedValue(data);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await productController.allProducts(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ products: data });
    });

    it('returns 404 and message when AppError (no products)', async () => {
      vi.mocked(productService.findAllProducts).mockRejectedValue(new AppError('No products found', 404));

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await productController.allProducts(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No products found' });
    });

    it('returns 500 on generic error', async () => {
      vi.mocked(productService.findAllProducts).mockRejectedValue(new Error('DB error'));

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await productController.allProducts(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
    });
  });

  describe('getProduct', () => {
    it('returns 200 and product when found', async () => {
      const product = { id: '1', productName: 'P1' };
      vi.mocked(productService.findProductById).mockResolvedValue(product as never);

      const req = mockRequest<{ productId: string }>({ params: { productId: '1' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.getProduct(req as never, res as never, next);

      expect(productService.findProductById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ product });
    });

    it('returns 404 when product not found', async () => {
      vi.mocked(productService.findProductById).mockRejectedValue(new AppError('Product not found', 404));

      const req = mockRequest<{ productId: string }>({ params: { productId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.getProduct(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });

  describe('userProducts', () => {
    it('returns 200 and products for user', async () => {
      const userProducts = { count: 1, rows: [{ id: '1', productName: 'P1' }] };
      vi.mocked(productService.findProductsByUserId).mockResolvedValue(userProducts as never);

      const req = mockRequest<{ userId: string }>({ params: { userId: 'user-1' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.userProducts(req as never, res as never, next);

      expect(productService.findProductsByUserId).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ products: userProducts });
    });

    it('returns 404 when no products for user', async () => {
      vi.mocked(productService.findProductsByUserId).mockRejectedValue(
        new AppError('No products found for this user', 404),
      );

      const req = mockRequest<{ userId: string }>({ params: { userId: 'user-1' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.userProducts(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No products found for this user' });
    });
  });

  describe('createProduct', () => {
    it('returns 201 and product when created', async () => {
      const created = { id: 'new-id', productName: 'Tomato', userId: 'user-1' };
      vi.mocked(productService.createProduct).mockResolvedValue(created as never);

      const req = mockRequest<object, { productName: string; price?: number }>({
        body: { productName: 'Tomato', price: 10 },
        userData: { UserId: 'user-1' },
      });
      const res = mockResponse();
      const next = mockNext();

      await productController.createProduct(req as never, res as never, next);

      expect(productService.createProduct).toHaveBeenCalledWith('user-1', expect.objectContaining({ productName: 'Tomato' }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product created successfully',
        product: created,
      });
    });

    it('returns 401 when userData is missing', async () => {
      const req = mockRequest<object, object>({ body: {}, userData: undefined });
      const res = mockResponse();
      const next = mockNext();

      await productController.createProduct(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid authentication token' });
      expect(productService.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('returns 200 when update succeeds', async () => {
      vi.mocked(productService.updateProduct).mockResolvedValue(undefined as never);

      const req = mockRequest<{ productId: string }, { productName: string }>({
        params: { productId: '1' },
        body: { productName: 'Updated' },
      });
      const res = mockResponse();
      const next = mockNext();

      await productController.updateProduct(req as never, res as never, next);

      expect(productService.updateProduct).toHaveBeenCalledWith('1', expect.objectContaining({ productName: 'Updated' }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product updated successfully' });
    });

    it('returns 404 when product not found', async () => {
      vi.mocked(productService.updateProduct).mockRejectedValue(new AppError('Product not found', 404));

      const req = mockRequest<{ productId: string }>({ params: { productId: 'missing' }, body: {} });
      const res = mockResponse();
      const next = mockNext();

      await productController.updateProduct(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });

  describe('removeProduct', () => {
    it('returns 200 when delete succeeds', async () => {
      vi.mocked(productService.removeProduct).mockResolvedValue(undefined as never);

      const req = mockRequest<{ productId: string }>({ params: { productId: '1' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.removeProduct(req as never, res as never, next);

      expect(productService.removeProduct).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product has been deleted successfully' });
    });

    it('returns 404 when product not found', async () => {
      vi.mocked(productService.removeProduct).mockRejectedValue(new AppError('Product not found', 404));

      const req = mockRequest<{ productId: string }>({ params: { productId: 'missing' } });
      const res = mockResponse();
      const next = mockNext();

      await productController.removeProduct(req as never, res as never, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });
});
