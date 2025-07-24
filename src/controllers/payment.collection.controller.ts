import User from "../models/user";
import Order from "../models/order";
import Transaction from "../models/transaction";
import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import sequelize from "../models";
import sendPushNotificationToUser from "../middleware/send-notification";
import handleExpoResponse, {
  ExpoResponse,
} from "../middleware/handleExpoResponse";
import AppError from "../errors/customErrors";

interface PaymentData {
  meanCode: string;
  amount: string;
  currency: string;
  orderNumber?: string;
}

interface AdwaResponse {
  data: {
    tokenCode?: string;
    adpFootprint?: string;
    status?: string;
    message?: string;
  };
}

interface PushNotificationMessage {
  title: string;
  text: string;
}

interface NotificationMessage {
  title: string;
  message: string;
}

interface CollectionWebhookRequest {
  status: string;
  footPrint: string;
  orderNumber: string;
  moyenPaiement: string;
  amount: number;
}

// Payment gateway adwapay configuration
const MERCHANT_KEY = process.env.ADWA_MERCHANT_KEY;
const APPLICATION_KEY = process.env.ADWA_APPLICATION_KEY;
const SUBSCRIPTION_KEY = process.env.ADWA_SUBSCRIPTION_KEY;
const BaseURL_Adwa = process.env.ADWA_BASE_URL;

if (!MERCHANT_KEY || !APPLICATION_KEY || !SUBSCRIPTION_KEY || !BaseURL_Adwa) {
  throw new Error("Missing required Adwa payment configuration");
}

// Get authentication token
const getAuthToken = async (): Promise<AdwaResponse> => {
  try {
    const data = JSON.stringify({
      application: APPLICATION_KEY,
    });

    const config = {
      method: "post",
      url: `${BaseURL_Adwa}/getADPToken`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(MERCHANT_KEY + ":" + SUBSCRIPTION_KEY).toString("base64")}`,
      },
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new AppError(
        `Failed to get auth token: ${error.response.data.message || error.message}`,
        error.response.status,
      );
    }
    throw new AppError("Failed to get auth token", 500);
  }
};

// Payment initiation
const paymentCollectRequest = async (
  data: PaymentData,
  token: string,
): Promise<AdwaResponse> => {
  try {
    const config = {
      method: "post",
      url: `${BaseURL_Adwa}/requestToPay`,
      headers: {
        "AUTH-API-TOKEN": `Bearer ${token}`,
        "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new AppError(
        `Payment request failed: ${error.response.data.message || error.message}`,
        error.response.status,
      );
    }
    throw new AppError("Payment request failed", 500);
  }
};

// Check payment status
const chargeStatusCheck = async (
  footPrint: string,
  meanCode: string,
  token: string,
): Promise<AdwaResponse> => {
  try {
    const data = JSON.stringify({
      adpFootprint: footPrint,
      meanCode,
    });

    const config = {
      method: "post",
      url: `${BaseURL_Adwa}/paymentStatus`,
      headers: {
        "AUTH-API-TOKEN": `Bearer ${token}`,
        "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY,
        "Content-Type": "application/json",
      },
      data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new AppError(
        `Failed to check payment status: ${error.response.data.message || error.message}`,
        error.response.status,
      );
    }
    throw new AppError("Failed to check payment status", 500);
  }
};

// Mobile payment collection
export const mobilePaymentCollection = async (
  req: Request<{ orderId: string }, unknown, PaymentData>,
  res: Response,
): Promise<void> => {
  const { orderId } = req.params;
  const paymentData = req.body;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError("Order not found or not created", 404);
    }

    const userToken = await getAuthToken();
    if (!userToken.data.tokenCode) {
      throw new AppError(
        "Unable to get the token from the payment service providers. Please try again",
        403,
      );
    }

    // Requesting payment initiation
    paymentData.orderNumber = `order_${orderId}_${Date.now()}`;
    const paymentRequest = await paymentCollectRequest(
      paymentData,
      userToken.data.tokenCode,
    );

    if (
      paymentData.meanCode === "MASTERCARD" ||
      paymentData.meanCode === "VISA"
    ) {
      res.json({ message: paymentRequest.data });
      return;
    }

    setTimeout(async () => {
      try {
        const resOutput = await chargeStatusCheck(
          paymentRequest.data.adpFootprint as string,
          paymentData.meanCode,
          userToken.data.tokenCode as string,
        );

        if (resOutput.data.status === "T") {
          await Transaction.update(
            {
              amount: parseFloat(paymentData.amount),
              status: "completed",
              txMethod: paymentData.meanCode,
              currency: paymentData.currency,
              orderId,
              txDetails: resOutput.data,
              updatedAt: new Date(),
            },
            { where: { orderId }, transaction },
          );

          await transaction.commit();

          res.status(200).json({
            status: "success",
            message: resOutput.data,
          });
        } else {
          await transaction.rollback();
          res.status(400).json({
            response: resOutput,
            message:
              "Payment was not successfully processed from the end-user.",
          });
        }
      } catch (error) {
        await transaction.rollback();
        if (error instanceof AppError) {
          res.status(error.statusCode).json({ message: error.message });
        } else {
          res.status(500).json({
            message:
              error instanceof Error
                ? error.message
                : "An error occurred during payment processing",
          });
        }
      }
    }, 100000);
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during payment processing",
      });
    }
  }
};

// Collection webhook response
export const collectionResponseAdwa = async (
  req: Request<unknown, unknown, CollectionWebhookRequest>,
  res: Response,
): Promise<void> => {
  const { status, footPrint, orderNumber, moyenPaiement, amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    if (status !== "T") {
      throw new AppError("Payment validation failed", 400);
    }

    const authToken = await getAuthToken();
    if (!authToken.data.tokenCode) {
      throw new AppError("Failed to get authentication token", 500);
    }

    const checkResponse = await chargeStatusCheck(
      footPrint,
      moyenPaiement,
      authToken.data.tokenCode,
    );

    if (checkResponse.data.status !== "T") {
      throw new AppError("Payment validation failed", 400);
    }

    const order = await Order.findByPk(orderNumber);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const [sellerData, buyerData] = await Promise.all([
      User.findByPk(order.sellerId),
      User.findByPk(order.buyerId),
    ]);

    await Promise.all([
      Transaction.update(
        {
          amount,
          status: "completed",
          txMethod: moyenPaiement,
          txDetails: checkResponse.data,
          updatedAt: new Date(),
        },
        { where: { orderId: order.id }, transaction },
      ),
      Order.update(
        {
          status: "processing",
          updatedAt: new Date(),
        },
        { where: { id: order.id }, transaction },
      ),
    ]);

    // Send notifications
    if (sellerData?.expoPushToken) {
      const notificationMessage: NotificationMessage = {
        title: "New Order",
        message: "Congratulations! You have received a New Order.",
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

    if (buyerData?.expoPushToken) {
      const notificationMessage: NotificationMessage = {
        title: "Payment Done",
        message:
          "Your Payment has been Successfully Made and Your order has started",
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
          order.buyerId,
          notificationMessage,
        );
      }
    }

    await transaction.commit();
    res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during payment processing",
      });
    }
  }
};
