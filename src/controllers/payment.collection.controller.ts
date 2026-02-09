import { Request, Response } from "express";
import sequelize from "../models";
import { AppError } from "../errors";
import { getPaymentProvider } from "../payment/providers";
import type { PaymentRequestPayload } from "../payment/types";
import * as paymentService from "../services/payment.collection.service";

// Mobile payment collection (provider-agnostic: uses configured provider, default ADWA)
export const mobilePaymentCollection = async (
  req: Request<{ orderId: string }, unknown, PaymentRequestPayload>,
  res: Response,
): Promise<void> => {
  const { orderId } = req.params;
  const paymentData = req.body;
  const transaction = await sequelize.transaction();

  try {
    await paymentService.getOrderForPayment(orderId);

    const provider = getPaymentProvider(
      (req.query.provider as string) || undefined,
    );
    const payload: PaymentRequestPayload = {
      meanCode: paymentData.meanCode,
      amount:
        typeof paymentData.amount === "number"
          ? String(paymentData.amount)
          : paymentData.amount,
      currency: paymentData.currency,
      orderNumber: `order_${orderId}_${Date.now()}`,
      paymentNumber: paymentData.paymentNumber,
      feesAmount: paymentData.feesAmount,
    };

    const paymentRequest = await provider.initiatePayment(payload, orderId);

    if (paymentRequest.redirectUrl) {
      res.json({
        message: {
          ...paymentRequest.raw,
          CARD_PAY_LINK: paymentRequest.redirectUrl,
          adpFootprint: paymentRequest.footprint,
          orderNumber: payload.orderNumber,
          status: paymentRequest.status,
        },
      });
      return;
    }

    if (!provider.requiresPollingAfterInitiate?.(paymentData.meanCode)) {
      res.json({ message: paymentRequest.raw });
      return;
    }

    const footprint = paymentRequest.footprint;
    if (!footprint) {
      res.status(400).json({
        message:
          "Payment initiation did not return a footprint for status check",
      });
      return;
    }

    setTimeout(async () => {
      try {
        const resOutput = await provider.checkStatus(
          footprint,
          paymentData.meanCode,
        );

        if (resOutput.success) {
          await paymentService.completeTransactionAfterPoll(
            orderId,
            {
              amount: payload.amount,
              meanCode: paymentData.meanCode,
              currency: paymentData.currency,
            },
            resOutput.raw ?? resOutput,
            transaction,
          );
          await transaction.commit();
          res.status(200).json({
            status: "success",
            message: resOutput.raw ?? resOutput,
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

export const collectionResponseAdwa = async (
  req: Request<unknown, unknown, paymentService.AdwaWebhookBody>,
  res: Response,
): Promise<void> => {
  try {
    const provider = getPaymentProvider("adwa");
    const checkResponse = await provider.checkStatus(
      req.body.footPrint,
      req.body.moyenPaiement,
    );
    const result = await paymentService.processAdwaWebhook(
      req.body,
      checkResponse,
    );
    res.status(200).json(result);
  } catch (error) {
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

export const confirmExternalPayment = async (
  req: Request<unknown, unknown, paymentService.ConfirmExternalPaymentBody>,
  res: Response,
): Promise<void> => {
  try {
    const result = await paymentService.confirmExternalPayment(req.body);
    res.status(200).json(result);
  } catch (error) {
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
