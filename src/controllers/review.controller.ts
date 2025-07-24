import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import Order from "../models/order";
import { Op, WhereOptions } from "sequelize";
import { Request, Response } from "express";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import { AuthenticatedRequest } from "../middleware/auth-check";
import AppError from "../errors/customErrors";

interface ReviewWhereClause {
  prodId: string;
  rating?: { [Op.eq]: number };
}

interface PushNotificationMessage {
  title: string;
  text: string;
}

interface NotificationMessage {
  title: string;
  message: string;
}

interface CreateReviewRequest {
  rating: number;
  comment: string;
}

type UpdateReviewRequest = Partial<CreateReviewRequest>;

// Get review of an order
const orderReview = async (
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const orderReview = await BuyerReview.findOne({
      where: { orderId: req.params.orderId },
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
        },
        {
          model: Product,
          attributes: ["id", "productName", "productCat", "imageUrl"],
        },
      ],
    });

    if (!orderReview) {
      throw new AppError("Review not found for this order", 404);
    }

    res.status(200).json({
      status: "success",
      orderReviewData: orderReview,
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

// Get reviews of a product
const getReviewByProdId = async (
  req: Request<{ productId: string }, unknown, unknown, { rating?: string }>,
  res: Response,
): Promise<void> => {
  try {
    const whereClause: ReviewWhereClause = {
      prodId: req.params.productId,
    };

    const { rating } = req.query;
    if (rating?.trim()) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new AppError(
          "Invalid rating value. Must be between 1 and 5",
          400,
        );
      }
      whereClause.rating = {
        [Op.eq]: ratingNum,
      };
    }

    const reviews = await BuyerReview.findAndCountAll({
      where: whereClause as unknown as WhereOptions,
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
        },
        {
          model: Product,
          attributes: ["id", "productName", "productCat", "imageUrl"],
        },
      ],
    });

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

// Create a review
const createReview = async (
  req: AuthenticatedRequest & {
    body: CreateReviewRequest;
    params: { productId: string; orderId: string };
  },
  res: Response,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    // Validate comment
    if (!comment?.trim()) {
      throw new AppError("Comment is required", 400);
    }

    const order = await Order.findOne({ where: { id: req.params.orderId } });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "delivered") {
      throw new AppError(
        "The order is still in processing or pending state. You cannot review yet",
        401,
      );
    }

    const reviewData = {
      prodId: req.params.productId,
      userId: req.userData.UserId,
      orderId: req.params.orderId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reviewOrder = { rating, comment };

    await BuyerReview.create(reviewData);

    await Order.update(
      {
        review: reviewOrder,
        updatedAt: new Date(),
      },
      { where: { id: req.params.orderId } },
    );

    const sellerData = await User.findByPk(order.sellerId);

    if (sellerData?.expoPushToken) {
      const notificationMessage: NotificationMessage = {
        title: "Order Reviewed",
        message: "You got a review on your order from the buyer",
      };

      const pushMessage: PushNotificationMessage = {
        title: notificationMessage.title,
        text: notificationMessage.message,
      };

      const result = await sendPushNotificationToUser(
        sellerData.expoPushToken,
        pushMessage,
      );

      if (result && "status" in result) {
        await handleExpoResponse(
          result as ExpoResponse,
          order.sellerId,
          notificationMessage,
        );
      }
    }

    res.status(201).json({ message: "Review added successfully" });
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

// Update a review
const updateReview = async (
  req: Request<{ reviewId: string }, unknown, UpdateReviewRequest>,
  res: Response,
): Promise<void> => {
  try {
    const { rating, comment } = req.body;

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    // Validate comment if provided
    if (comment !== undefined && !comment.trim()) {
      throw new AppError("Comment cannot be empty", 400);
    }

    const review = await BuyerReview.findByPk(req.params.reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    const [updatedCount] = await BuyerReview.update(
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { where: { id: req.params.reviewId } },
    );

    if (updatedCount === 0) {
      throw new AppError("Failed to update review", 500);
    }

    res.status(200).json({ message: "Review updated successfully" });
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

// Delete own review
const deleteOwnReview = async (
  req: AuthenticatedRequest & { params: { reviewId: string } },
  res: Response,
): Promise<void> => {
  try {
    if (!req.userData || typeof req.userData === "string") {
      throw new AppError("Invalid authentication token", 401);
    }

    const review = await BuyerReview.findOne({
      where: { id: req.params.reviewId },
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
        },
      ],
    });

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== req.userData.UserId) {
      throw new AppError("You are not authorized to delete this review", 403);
    }

    const deletedCount = await BuyerReview.destroy({
      where: { id: req.params.reviewId },
    });

    if (deletedCount === 0) {
      throw new AppError("Failed to delete review", 500);
    }

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

export {
  getReviewByProdId,
  createReview,
  updateReview,
  deleteOwnReview,
  orderReview,
};
