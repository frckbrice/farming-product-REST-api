import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../setup';
import { mockModels } from '../mocks/sequelize';
import * as productService from '../../src/services/product.service';

describe('product.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModels.Product.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    mockModels.Product.findOne.mockResolvedValue(null);
    mockModels.Product.findByPk.mockResolvedValue(null);
    mockModels.Product.create.mockImplementation((data: object) =>
      Promise.resolve({ ...data, id: 'product-id' }),
    );
    mockModels.Product.update.mockResolvedValue([1]);
    mockModels.Product.destroy.mockResolvedValue(1);
  });

  describe('findAllProducts', () => {
    it('throws AppError when no products found', async () => {
      mockModels.Product.findAndCountAll.mockResolvedValue(null);

      await expect(productService.findAllProducts()).rejects.toMatchObject({
        message: 'No products found',
        statusCode: 404,
      });
    });

    it('returns count and rows', async () => {
      const rows = [{ id: '1', productName: 'P1' }];
      mockModels.Product.findAndCountAll.mockResolvedValue({ count: 1, rows });

      const result = await productService.findAllProducts();
      expect(result.count).toBe(1);
      expect(result.rows).toEqual(rows);
    });
  });

  describe('findProductById', () => {
    it('throws AppError when product not found', async () => {
      mockModels.Product.findOne.mockResolvedValue(null);

      await expect(
        productService.findProductById('missing-id'),
      ).rejects.toMatchObject({
        message: 'Product not found',
        statusCode: 404,
      });
    });

    it('returns product when found', async () => {
      const product = { id: '1', productName: 'P1' };
      mockModels.Product.findOne.mockResolvedValue(product);

      const result = await productService.findProductById('1');
      expect(result).toEqual(product);
    });
  });

  describe('findProductsByUserId', () => {
    it('throws AppError when no products for user', async () => {
      mockModels.Product.findAndCountAll.mockResolvedValue(null);

      await expect(
        productService.findProductsByUserId('user-1'),
      ).rejects.toMatchObject({
        message: 'No products found for this user',
        statusCode: 404,
      });
    });
  });

  describe('createProduct', () => {
    it('creates product with userId and returns it', async () => {
      const input = {
        productName: 'Tomato',
        price: 10,
        userId: 'user-1',
      };
      mockModels.Product.create.mockResolvedValue({ ...input, id: 'new-id' });

      const result = await productService.createProduct('user-1', input);
      expect(mockModels.Product.create).toHaveBeenCalled();
      expect(result.id).toBe('new-id');
    });
  });

  describe('updateProduct', () => {
    it('throws AppError when product not found', async () => {
      mockModels.Product.findByPk.mockResolvedValue(null);

      await expect(
        productService.updateProduct('missing', { productName: 'X' }),
      ).rejects.toMatchObject({
        message: 'Product not found',
        statusCode: 404,
      });
    });

    it('throws AppError when update returns 0', async () => {
      mockModels.Product.findByPk.mockResolvedValue({ id: '1' });
      mockModels.Product.update.mockResolvedValue([0]);

      await expect(
        productService.updateProduct('1', { productName: 'X' }),
      ).rejects.toMatchObject({
        message: 'Failed to update product',
        statusCode: 500,
      });
    });
  });

  describe('removeProduct', () => {
    it('throws AppError when product not found', async () => {
      mockModels.Product.findByPk.mockResolvedValue(null);

      await expect(productService.removeProduct('missing')).rejects.toMatchObject(
        {
          message: 'Product not found',
          statusCode: 404,
        },
      );
    });

    it('throws AppError when destroy returns 0', async () => {
      mockModels.Product.findByPk.mockResolvedValue({ id: '1' });
      mockModels.Product.destroy.mockResolvedValue(0);

      await expect(productService.removeProduct('1')).rejects.toMatchObject({
        message: 'Failed to delete product',
        statusCode: 500,
      });
    });
  });
});
