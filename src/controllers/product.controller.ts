import * as fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";
import { AppError } from "../errors";
import * as productService from "../services/product.service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const allProducts = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const products = await productService.findAllProducts();
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

export const getProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const foundProduct = await productService.findProductById(
      req.params.productId,
    );
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

export const userProducts = async (
  req: Request<{ userId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const userProducts = await productService.findProductsByUserId(
      req.params.userId,
    );
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

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    const body = { ...req.body };
    if (req.file?.path) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        req.file.path,
        { resource_type: "image" },
      );
      body.imageUrl = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const result = await productService.createProduct(
      req.userData.UserId,
      body,
    );

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

export const updateProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const body = { ...req.body };
    if (req.file?.path) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        req.file.path,
      );
      body.imageUrl = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path);
    }

    await productService.updateProduct(req.params.productId, body);
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

export const removeProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    await productService.removeProduct(req.params.productId);
    res.status(200).json({
      message: "Product has been deleted successfully",
    });
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
