import * as fs from "fs";
import User from "../models/user";
import Role from "../models/role";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";
import AppError from "../errors/customErrors";

interface CloudinaryResponse {
  secure_url: string;
}

interface CreateProductRequest {
  productName: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
}

type UpdateProductRequest = Partial<CreateProductRequest>;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all products
export const allProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await Product.findAndCountAll({
      include: [
        {
          model: User,
          attributes: [
            "id",
            "firstName",
            "lastName",
            "country",
            "verifiedUser",
          ],
          include: [{ model: Role }],
        },
      ],
    });

    if (!products) {
      throw new AppError("No products found", 404);
    }

    res.status(200).json({ products });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error getting products",
    });
  }
};

// Get a product by ID
export const getProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const foundProduct = await Product.findOne({
      where: { id: req.params.productId },
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

    res.status(200).json({ product: foundProduct });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error getting product",
    });
  }
};

// Get all products of a user
export const userProducts = async (
  req: Request<{ userId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const userProducts = await Product.findAndCountAll({
      where: { userId: req.params.userId },
    });

    if (!userProducts) {
      throw new AppError("No products found for this user", 404);
    }

    res.status(200).json({ products: userProducts });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error getting user products",
    });
  }
};

// Create a new product
export const createProduct = async (
  req: AuthenticatedRequest & { body: CreateProductRequest },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    const { productName, description, price, quantity, category } = req.body;

    // Validate required fields
    if (!productName || !description || !price || !quantity || !category) {
      throw new AppError("Missing required fields", 400);
    }

    const productData = {
      ...req.body,
      userId: req.userData.UserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (req.file) {
      const cloudinaryResponse = (await cloudinary.uploader.upload(
        req.file.path,
        { resource_type: "image" },
      )) as CloudinaryResponse;

      productData.imageUrl = cloudinaryResponse.secure_url;

      // Remove the file from public directory
      fs.unlinkSync(req.file.path);
    }

    const result = await Product.create(productData);

    res.status(201).json({
      message: "Product created successfully",
      product: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

// Update a product
export const updateProduct = async (
  req: Request<{ productId: string }, unknown, UpdateProductRequest>,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (req.file) {
      const cloudinaryResponse = (await cloudinary.uploader.upload(
        req.file.path,
      )) as CloudinaryResponse;

      req.body.imageUrl = cloudinaryResponse.secure_url;

      // Remove the file from public directory
      fs.unlinkSync(req.file.path);
    }

    const productData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const [updatedCount] = await Product.update(productData, {
      where: { id: req.params.productId },
    });

    if (updatedCount === 0) {
      throw new AppError("Failed to update product", 500);
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error updating product",
    });
  }
};

// Delete a product
export const removeProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const deletedCount = await Product.destroy({
      where: { id: req.params.productId },
    });

    if (deletedCount === 0) {
      throw new AppError("Failed to delete product", 500);
    }

    res.status(200).json({ message: "Product has been deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error deleting product",
    });
  }
};
