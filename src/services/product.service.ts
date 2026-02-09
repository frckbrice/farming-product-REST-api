import User from "../models/user";
import Role from "../models/role";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import { AppError } from "../errors";
import type { ProductAttributes } from "../types";

export interface CreateProductInput {
  productName?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  productCat?: string;
  priceType?: string;
  wholeSale?: boolean;
  imageUrl?: string;
  userId: string;
  [key: string]: unknown;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export async function findAllProducts(): Promise<{
  count: number;
  rows: Product[];
}> {
  const products = await Product.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
        include: [{ model: Role }],
      },
    ],
  });

  if (!products) {
    throw new AppError("No products found", 404);
  }

  return products;
}

export async function findProductById(productId: string): Promise<Product> {
  const foundProduct = await Product.findOne({
    where: { id: productId },
    include: [
      {
        model: User,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "country",
          "imageUrl",
          "verifiedUser",
        ],
      },
      {
        model: BuyerReview,
        attributes: ["id", "comment", "rating", "createdAt"],
        required: false,
        include: [
          {
            model: User,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "country",
              "imageUrl",
              "verifiedUser",
            ],
          },
        ],
      },
    ],
  });

  if (!foundProduct) {
    throw new AppError("Product not found", 404);
  }

  return foundProduct;
}

export async function findProductsByUserId(
  userId: string,
): Promise<{ count: number; rows: Product[] }> {
  const userProducts = await Product.findAndCountAll({
    where: { userId },
  });

  if (!userProducts) {
    throw new AppError("No products found for this user", 404);
  }

  return userProducts;
}

export async function createProduct(
  userId: string,
  data: Omit<CreateProductInput, "userId"> & { imageUrl?: string },
): Promise<Product> {
  const productData: ProductAttributes = {
    ...data,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return await Product.create(productData);
}

export async function updateProduct(
  productId: string,
  data: UpdateProductInput & { imageUrl?: string },
): Promise<void> {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const productData = {
    ...data,
    updatedAt: new Date(),
  };

  const [updatedCount] = await Product.update(productData, {
    where: { id: productId },
  });

  if (updatedCount === 0) {
    throw new AppError("Failed to update product", 500);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const deletedCount = await Product.destroy({
    where: { id: productId },
  });

  if (deletedCount === 0) {
    throw new AppError("Failed to delete product", 500);
  }
}
