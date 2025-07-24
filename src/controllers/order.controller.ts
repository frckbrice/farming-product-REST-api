import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import Order from "../models/order";
import Transaction from "../models/transaction";
import sequelize from "../models";
import { Op, WhereOptions } from "sequelize";
import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/customErrors";

// Type definitions
interface OrderWhereClause {
  sellerId?: string;
  buyerId?: string;
  status?: string | { [Op.like]: string };
}

interface ProductWhereClause {
  productName?: { [Op.like]: string };
}

interface PushNotificationMessage {
  title: string;
  text: string;
}

interface NotificationMessage {
  title: string;
  message: string;
}

interface DispatchDetails {
  dispatchedAt: Date;
  method: string;
  imageUrl?: string;
}

interface CreateOrderRequest {
  amount: number;
  shipAddress: string;
  weight: string;
  sellerId: string;
}

interface UpdateOrderRequest {
  userId: string;
}

interface DispatchRequest {
  method: string;
  date: Date;
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get order by ID
export const getOrderById = async (
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const orderData = await Order.findOne({
      where: { id: req.params.orderId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "country",
            "verifiedUser",
          ],
        },
        {
          model: User,
          as: "seller",
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
              model: BuyerReview,
              attributes: ["id", "comment", "rating"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!orderData) {
      throw new AppError("Order not found", 404);
    }

    res.status(200).json({
      status: "success",
      order: orderData,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Get buyer orders
export const getBuyerOrders = async (
  req: Request<{ buyerId: string }, unknown, unknown, { orderStatus?: string }>,
  res: Response,
): Promise<void> => {
  const { buyerId } = req.params;
  const { orderStatus } = req.query;

  const whereClause: OrderWhereClause = {
    buyerId,
  };

  if (orderStatus && orderStatus.trim() !== "") {
    whereClause.status = orderStatus;
  }

  try {
    const buyerOrders = await Order.findAndCountAll({
      where: whereClause as WhereOptions,
      include: [
        {
          model: User,
          as: "seller",
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
              model: BuyerReview,
              attributes: ["id", "comment", "rating"],
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      ordersData: buyerOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Get seller orders
export const getSellerOrders = async (
  req: Request<
    { sellerId: string },
    unknown,
    unknown,
    { orderStatus?: string; productName?: string }
  >,
  res: Response,
): Promise<void> => {
  const { sellerId } = req.params;
  const { orderStatus, productName } = req.query;

  const whereClause: OrderWhereClause = {
    sellerId,
  };

  const prodWhereClause: ProductWhereClause = {};

  if (orderStatus && orderStatus.trim() !== "") {
    whereClause.status = orderStatus;
  }
  if (productName && productName.trim() !== "") {
    prodWhereClause.productName = {
      [Op.like]: `%${productName}%`,
    };
  }

  try {
    const sellerOrders = await Order.findAndCountAll({
      where: whereClause as WhereOptions,
      include: [
        {
          model: User,
          as: "buyer",
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
          where: prodWhereClause as WhereOptions,
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
              model: BuyerReview,
              attributes: ["id", "comment", "rating"],
              required: false,
            },
          ],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      ordersData: sellerOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Create order
export const createOrder = async (
  req: Request<{ productId: string }, unknown, CreateOrderRequest>,
  res: Response,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { amount, shipAddress, weight, sellerId } = req.body;

    // Validate required fields
    if (!amount || !shipAddress || !weight || !sellerId) {
      throw new AppError("Missing required fields", 400);
    }

    // Validate the sellerId Before Inserting
    const seller = await User.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new AppError("Invalid sellerId: Seller does not exist", 400);
    }

    const order = await Order.create(
      {
        amount,
        shipAddress,
        weight,
        sellerId: seller.id,
        prodId: req.params.productId,
        buyerId: "3ff1ceec-9f0d-4952-9c6c-fe3973dd8fa1", // TODO: Replace with actual buyer ID from auth
        status: "pending",
        dispatched: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction },
    );

    await Transaction.create(
      {
        amount: order.amount,
        orderId: order.id,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction },
    );

    await transaction.commit();

    res.status(200).json({
      message:
        "Order created successfully. Please proceed toward payment else order can not be processed further",
      orderDetails: order,
    });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Update order
export const updateOrder = async (
  req: Request<{ orderId: string }, unknown, UpdateOrderRequest>,
  res: Response,
): Promise<void> => {
  try {
    const txOrder = await Transaction.findOne({
      where: { orderId: req.params.orderId },
    });

    if (!txOrder) {
      throw new AppError("Transaction not found for this order", 404);
    }

    if (txOrder.status !== "completed") {
      throw new AppError(
        "This Order is not in Transaction. Please make payment first",
        403,
      );
    }

    await Order.update(
      {
        status: "processing",
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.orderId },
      },
    );

    const orderData = await Order.findByPk(req.params.orderId);
    if (!orderData) {
      throw new AppError("Order not found", 404);
    }

    const [sellerData, buyerData] = await Promise.all([
      User.findByPk(orderData.sellerId),
      User.findByPk(req.body.userId),
    ]);

    // Send notifications
    if (sellerData?.expoPushToken) {
      const notificationMessage: NotificationMessage = {
        title: "Order Completed",
        message: "Congratulations! Your Order has been marked as completed",
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
          orderData.sellerId,
          notificationMessage,
        );
      }
    }

    if (buyerData?.expoPushToken) {
      const notificationMessage: NotificationMessage = {
        title: "Order Completion",
        message: "You have marked your order as completed",
      };

      const pushMessage: PushNotificationMessage = {
        title: notificationMessage.title,
        text: notificationMessage.message,
      };

      const result = await sendPushNotificationToUser(
        buyerData.expoPushToken,
        pushMessage,
      );

      if (result && "status" in result) {
        await handleExpoResponse(
          result as ExpoResponse,
          req.body.userId,
          notificationMessage,
        );
      }
    }

    res.status(200).json({ message: "Order Completed Successfully!" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Get transaction
export const getTransaction = async (
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await Transaction.findOne({
      where: { orderId: req.params.orderId },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    res.status(200).json({
      message: "Transaction Details",
      details: transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

// Update dispatch details
export const updateDispatchDetails = async (
  req: Request<{ orderId: string }, unknown, DispatchRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { method, date } = req.body;

    if (!method || !date) {
      throw new AppError("Method and date are required", 400);
    }

    const details: DispatchDetails = {
      dispatchedAt: new Date(),
      method,
    };

    if (req.file) {
      const cloudinaryImageUpload = await cloudinary.uploader.upload(
        req.file.path,
        {
          resource_type: "image",
        },
      );

      details.imageUrl = cloudinaryImageUpload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const [updatedCount] = await Order.update(
      {
        status: "dispatched",
        dispatched: true,
        dispatchDetails: details,
        deliveryDate: date,
        updatedAt: new Date(),
      },
      {
        where: { id: orderId },
      },
    );

    if (updatedCount === 0) {
      throw new AppError("Order not found", 404);
    }

    res.status(200).json({
      message: "Dispatch details updated successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
