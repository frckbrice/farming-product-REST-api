import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import Order from "../models/order";
import { Op, WhereOptions } from "sequelize";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import { AppError } from "../errors";

export interface CreateReviewInput {
  rating: number;
  comment: string;
}

export type UpdateReviewInput = Partial<CreateReviewInput>;

export async function getReviewByOrderId(orderId: string) {
  const orderReview = await BuyerReview.findOne({
    where: { orderId },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
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

  return orderReview;
}

export async function getReviewsByProductId(
  productId: string,
  rating?: string,
) {
  const whereClause: { prodId: string; rating?: { [Op.eq]: number } } = {
    prodId: productId,
  };

  if (rating?.trim()) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new AppError("Invalid rating value. Must be between 1 and 5", 400);
    }
    whereClause.rating = { [Op.eq]: ratingNum };
  }

  return await BuyerReview.findAndCountAll({
    where: whereClause as WhereOptions,
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
      },
      {
        model: Product,
        attributes: ["id", "productName", "productCat", "imageUrl"],
      },
    ],
  });
}

export async function createReview(
  productId: string,
  orderId: string,
  userId: string,
  data: CreateReviewInput,
): Promise<{ message: string }> {
  const { rating, comment } = data;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  if (!comment?.trim()) {
    throw new AppError("Comment is required", 400);
  }

  const order = await Order.findOne({ where: { id: orderId } });
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status !== "delivered") {
    throw new AppError(
      "The order is still in processing or pending state. You cannot review yet",
      401,
    );
  }

  await BuyerReview.create({
    prodId: productId,
    userId,
    orderId,
    rating,
    comment,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await Order.update(
    {
      review: { rating, comment },
      updatedAt: new Date(),
    },
    { where: { id: orderId } },
  );

  const sellerData = await User.findByPk(order.sellerId);
  if (sellerData?.expoPushToken) {
    const notificationMessage = {
      title: "Order Reviewed",
      message: "You got a review on your order from the buyer",
    };
    const result = await sendPushNotificationToUser(sellerData.expoPushToken, {
      title: notificationMessage.title,
      text: notificationMessage.message,
    });
    if (result && "status" in result) {
      await handleExpoResponse(
        result as ExpoResponse,
        order.sellerId,
        notificationMessage,
      );
    }
  }

  return { message: "Review added successfully" };
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewInput,
): Promise<{ message: string }> {
  const { rating, comment } = data;

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  if (comment !== undefined && !comment.trim()) {
    throw new AppError("Comment cannot be empty", 400);
  }

  const review = await BuyerReview.findByPk(reviewId);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  const [updatedCount] = await BuyerReview.update(
    { ...data, updatedAt: new Date() },
    { where: { id: reviewId } },
  );

  if (updatedCount === 0) {
    throw new AppError("Failed to update review", 500);
  }

  return { message: "Review updated successfully" };
}

export async function deleteReview(
  reviewId: string,
  userId: string,
): Promise<void> {
  const review = await BuyerReview.findOne({
    where: { id: reviewId },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
      },
    ],
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== userId) {
    throw new AppError("You are not authorized to delete this review", 403);
  }

  const deletedCount = await BuyerReview.destroy({
    where: { id: reviewId },
  });

  if (deletedCount === 0) {
    throw new AppError("Failed to delete review", 500);
  }
}
