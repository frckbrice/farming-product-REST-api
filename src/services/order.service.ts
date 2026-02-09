import User from "../models/user";
import BuyerReview from "../models/buyerreview";
import Product from "../models/product";
import Order from "../models/order";
import Transaction from "../models/transaction";
import sequelize from "../models";
import { Op, WhereOptions } from "sequelize";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import { AppError } from "../errors";

export interface CreateOrderInput {
  amount: number;
  shipAddress: string;
  weight: string;
  sellerId: string;
}

export interface UpdateOrderInput {
  userId: string;
}

export interface DispatchDetailsInput {
  method: string;
  date: Date | string;
  imageUrl?: string;
}

export async function getOrderById(orderId: string) {
  const orderData = await Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: User,
        as: "buyer",
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
      },
      {
        model: User,
        as: "seller",
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
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

  return orderData;
}

export async function getBuyerOrders(
  buyerId: string,
  orderStatus?: string,
) {
  const whereClause: { buyerId: string; status?: string } = { buyerId };
  if (orderStatus?.trim()) {
    whereClause.status = orderStatus;
  }

  return await Order.findAndCountAll({
    where: whereClause as WhereOptions,
    include: [
      {
        model: User,
        as: "seller",
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
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
}

export async function getSellerOrders(
  sellerId: string,
  orderStatus?: string,
  productName?: string,
) {
  const whereClause: { sellerId: string; status?: string } = { sellerId };
  const prodWhereClause: { productName?: { [Op.like]: string } } = {};
  if (orderStatus?.trim()) {
    whereClause.status = orderStatus;
  }
  if (productName?.trim()) {
    prodWhereClause.productName = { [Op.like]: `%${productName}%` };
  }

  return await Order.findAndCountAll({
    where: whereClause as WhereOptions,
    include: [
      {
        model: User,
        as: "buyer",
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
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
}

export async function createOrder(
  productId: string,
  body: CreateOrderInput,
  buyerId: string,
) {
  const { amount, shipAddress, weight, sellerId } = body;

  if (!amount || !shipAddress || !weight || !sellerId) {
    throw new AppError("Missing required fields", 400);
  }

  const seller = await User.findOne({ where: { id: sellerId } });
  if (!seller) {
    throw new AppError("Invalid sellerId: Seller does not exist", 400);
  }

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.create(
      {
        amount,
        shipAddress,
        weight,
        sellerId: seller.id,
        prodId: productId,
        buyerId,
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

    return {
      message:
        "Order created successfully. Please proceed toward payment else order can not be processed further",
      orderDetails: order,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function sendOrderCompleteNotifications(
  sellerId: string,
  buyerId: string,
): Promise<void> {
  const [sellerData, buyerData] = await Promise.all([
    User.findByPk(sellerId),
    User.findByPk(buyerId),
  ]);

  if (sellerData?.expoPushToken) {
    const notificationMessage = {
      title: "Order Completed",
      message:
        "Congratulations! Your Order has been marked as completed",
    };
    const result = await sendPushNotificationToUser(sellerData.expoPushToken, {
      title: notificationMessage.title,
      text: notificationMessage.message,
    });
    if (result && "status" in result) {
      await handleExpoResponse(
        result as ExpoResponse,
        sellerId,
        notificationMessage,
      );
    }
  }

  if (buyerData?.expoPushToken) {
    const notificationMessage = {
      title: "Order Completion",
      message: "You have marked your order as completed",
    };
    const result = await sendPushNotificationToUser(buyerData.expoPushToken, {
      title: notificationMessage.title,
      text: notificationMessage.message,
    });
    if (result && "status" in result) {
      await handleExpoResponse(
        result as ExpoResponse,
        buyerId,
        notificationMessage,
      );
    }
  }
}

export async function updateOrder(
  orderId: string,
  userId: string,
): Promise<{ message: string }> {
  const txOrder = await Transaction.findOne({
    where: { orderId },
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
    { status: "processing", updatedAt: new Date() },
    { where: { id: orderId } },
  );

  const orderData = await Order.findByPk(orderId);
  if (!orderData) {
    throw new AppError("Order not found", 404);
  }

  await sendOrderCompleteNotifications(orderData.sellerId, userId);

  return { message: "Order Completed Successfully!" };
}

export async function getTransactionByOrderId(orderId: string) {
  const transaction = await Transaction.findOne({
    where: { orderId },
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  return transaction;
}

export async function updateDispatchDetails(
  orderId: string,
  details: DispatchDetailsInput,
): Promise<{ message: string }> {
  const { method, date, imageUrl } = details;

  if (!method || !date) {
    throw new AppError("Method and date are required", 400);
  }

  const dispatchPayload = {
    status: "dispatched" as const,
    dispatched: true,
    dispatchDetails: {
      dispatchedAt: new Date(),
      method,
      ...(imageUrl && { imageUrl }),
    },
    deliveryDate: typeof date === "string" ? new Date(date) : date,
    updatedAt: new Date(),
  };

  const [updatedCount] = await Order.update(dispatchPayload, {
    where: { id: orderId },
  });

  if (updatedCount === 0) {
    throw new AppError("Order not found", 404);
  }

  return { message: "Dispatch details updated successfully" };
}
