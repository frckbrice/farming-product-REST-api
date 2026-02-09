import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";
import { AppError } from "../errors";
import * as reviewService from "../services/review.service";

export const orderReview = async (
  req: Request<{ orderId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const orderReviewData = await reviewService.getReviewByOrderId(
      req.params.orderId,
    );
    res.status(200).json({
      status: "success",
      orderReviewData,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Error retrieving order review",
    });
  }
};

export const getReviewByProdId = async (
  req: Request<{ productId: string }, unknown, unknown, { rating?: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const reviews = await reviewService.getReviewsByProductId(
      req.params.productId,
      req.query.rating,
    );
    if (!reviews.count) {
      res.status(200).json({
        message: "No reviews found for this product",
        reviews,
      });
      return;
    }
    res.status(200).json({ reviews });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Error retrieving product reviews",
    });
  }
};

export const createReview = async (
  req: AuthenticatedRequest & {
    body: reviewService.CreateReviewInput;
    params: { productId: string; orderId: string };
  },
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }
    const result = await reviewService.createReview(
      req.params.productId,
      req.params.orderId,
      req.userData.UserId,
      req.body,
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error creating review",
    });
  }
};

export const updateReview = async (
  req: Request<{ reviewId: string }, unknown, reviewService.UpdateReviewInput>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const result = await reviewService.updateReview(
      req.params.reviewId,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error updating review",
    });
  }
};

export const deleteOwnReview = async (
  req: AuthenticatedRequest & { params: { reviewId: string } },
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }
    await reviewService.deleteReview(req.params.reviewId, req.userData.UserId);
    res.status(204).end();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error deleting review",
    });
  }
};
