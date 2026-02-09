import User from "../models/user";
import Order from "../models/order";
import Transaction from "../models/transaction";
import sequelize from "../models";
import { Transaction as SequelizeTransaction } from "sequelize";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import { AppError } from "../errors";

export interface AdwaWebhookBody {
  status: string;
  footPrint: string;
  orderNumber: string;
  moyenPaiement: string;
  amount: number;
}

export interface ConfirmExternalPaymentBody {
  orderId: string;
  amount: number;
  currency: string;
  externalPaymentId: string;
  provider?: string;
}

async function sendPaymentSuccessNotifications(orderId: string): Promise<void> {
  const order = await Order.findByPk(orderId);
  if (!order) return;

  const [sellerData, buyerData] = await Promise.all([
    User.findByPk(order.sellerId),
    User.findByPk(order.buyerId),
  ]);

  if (sellerData?.expoPushToken) {
    const msg = {
      title: "New Order",
      message: "Congratulations! You have received a New Order.",
    };
    const result = await sendPushNotificationToUser(sellerData.expoPushToken, {
      title: msg.title,
      text: msg.message,
    });
    if (result && "status" in result) {
      await handleExpoResponse(result as ExpoResponse, order.sellerId, msg);
    }
  }

  if (buyerData?.expoPushToken) {
    const msg = {
      title: "Payment Done",
      message:
        "Your Payment has been Successfully Made and Your order has started",
    };
    const result = await sendPushNotificationToUser(buyerData.expoPushToken, {
      title: msg.title,
      text: msg.message,
    });
    if (result && "status" in result) {
      await handleExpoResponse(result as ExpoResponse, order.buyerId, msg);
    }
  }
}

export async function getOrderForPayment(orderId: string) {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new AppError("Order not found or not created", 404);
  }
  return order;
}

export async function completeTransactionAfterPoll(
  orderId: string,
  payload: {
    amount: string;
    meanCode: string;
    currency: string;
  },
  txDetails: unknown,
  transaction: SequelizeTransaction,
): Promise<void> {
  await Transaction.update(
    {
      amount: parseFloat(payload.amount),
      status: "completed",
      txMethod: payload.meanCode,
      currency: payload.currency,
      orderId,
      txDetails: txDetails ?? undefined,
      updatedAt: new Date(),
    },
    { where: { orderId }, transaction },
  );
}

export async function processAdwaWebhook(
  body: AdwaWebhookBody,
  checkResponse: { success: boolean; raw?: unknown },
): Promise<{ message: string }> {
  const { status, amount, orderNumber, moyenPaiement } = body;

  if (status !== "T") {
    throw new AppError("Payment validation failed", 400);
  }

  if (!checkResponse.success) {
    throw new AppError("Payment validation failed", 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderNumber);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await Promise.all([
      Transaction.update(
        {
          amount,
          status: "completed",
          txMethod: moyenPaiement,
          txDetails: checkResponse.raw ?? checkResponse,
          updatedAt: new Date(),
        },
        { where: { orderId: order.id }, transaction },
      ),
      Order.update(
        { status: "processing", updatedAt: new Date() },
        { where: { id: order.id }, transaction },
      ),
    ]);

    await transaction.commit();

    await sendPaymentSuccessNotifications(order.id);

    return { message: "Payment processed successfully" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function confirmExternalPayment(
  body: ConfirmExternalPaymentBody,
): Promise<{ message: string; orderId: string; status: string }> {
  const { orderId, amount, currency, externalPaymentId, provider } = body;

  if (!orderId || amount == null || !currency || !externalPaymentId) {
    throw new AppError(
      "Missing required fields: orderId, amount, currency, externalPaymentId",
      400,
    );
  }

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await Promise.all([
      Transaction.update(
        {
          amount,
          status: "completed",
          txMethod: "MASTERCARD",
          currency,
          txDetails: {
            externalPaymentId,
            provider: provider ?? "external",
            confirmedAt: new Date().toISOString(),
            external: true,
          },
          updatedAt: new Date(),
        },
        { where: { orderId: order.id }, transaction },
      ),
      Order.update(
        { status: "processing", updatedAt: new Date() },
        { where: { id: order.id }, transaction },
      ),
    ]);

    await transaction.commit();

    await sendPaymentSuccessNotifications(order.id);

    return {
      message: "Payment confirmed successfully",
      orderId,
      status: "processing",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
