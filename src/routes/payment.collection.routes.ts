import express, { NextFunction, Request, Response, Router } from "express";
import authCheck from "../middleware/auth-check";
import {
  collectionResponseAdwa,
  confirmExternalPayment,
  mobilePaymentCollection,
} from "../controllers/payment.collection.controller";
import { z } from "zod";

const paymentSchema = z.object({
  meanCode: z.string().min(1),
  paymentNumber: z.string().min(1),
  currency: z.string().min(1),
  feesAmount: z.number().min(0),
  amount: z.number().min(1),
});

function validatePayment(req: Request, res: Response, next: NextFunction) {
  const parsed = paymentSchema.safeParse({
    ...req.body,
    amount: req.body.amount ? Number(req.body.amount) : undefined,
    feesAmount: req.body.feesAmount ? Number(req.body.feesAmount) : undefined,
  });
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  next();
}

const paymentCollectionRoute: Router = express.Router();

paymentCollectionRoute.post("/webhook/adwapay", collectionResponseAdwa);

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  security:
 *      - bearerAuth: []
 */

/**
 * @swagger
 * tags:
 *   name: Payment Collection
 *   description: API for managing user payment Collection
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - meanCode
 *         - currency
 *       properties:
 *         amount:
 *           type: string
 *           description: The payment amount
 *           example: "1000.00"
 *         meanCode:
 *           type: string
 *           description: Payment method code (MASTERCARD, VISA, etc.)
 *           example: "MASTERCARD"
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "XAF"
 *         phoneNumber:
 *           type: string
 *           description: Customer phone number (required for mobile payments)
 *           example: "237612345678"
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Status of the payment operation
 *           example: "success"
 *         message:
 *           type: object
 *           description: Payment processing response
 *           properties:
 *             status:
 *               type: string
 *               example: "T"
 *             transactionId:
 *               type: string
 *               example: "PAY123456789"
 *             timestamp:
 *               type: string
 *               example: "2023-03-15T10:20:30Z"
 */

/**
 * @swagger
 * /user/transaction/{orderId}/paymentCollection/mobile:
 *  post:
 *      summary: Payment route for either mobile or card
 *      tags: [Payment Collection]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: orderId
 *          schema:
 *              type: string
 *          required: true
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          meanCode:
 *                              type: string
 *                          paymentNumber:
 *                              type: string
 *                          currency:
 *                              type: string
 *                          feesAmount:
 *                              type: string
 *                          amount:
 *                              type: integer
 *                      example:
 *                          meanCode: MOBILE-MONEY or ORANGE-MONEY or VISA or MASTERCARD
 *                          paymentNumber: 672151908
 *                          currency: XAF
 *                          amount: 200
 *                          feesAmount: 0
 *
 *      responses:
 *          200:
 *              description: data object in the response contains the following example output which you may use. For visa or mastercard redirect the user the card pay link where the user will complete the transaction
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                      examples:
 *                          MOBILE-MONEY OR ORANGE-MONEY:
 *                              value:
 *                                  adpFootprint: GOSHENWATER_CDF412FBA4535
 *                                  status: T
 *                                  meanCode: MOBILE-MONEY,
 *                                  orderNumber: order_a049662d-e152-4dae-8e30-c010cc95435e_1718824055475
 *                          VISA or MASTERCARD:
 *                              value:
 *                                  adpFootprint: GOSHENWATER_56964554A5E4C
 *                                  orderNumber: order_a049662d-e152-4dae-8e30-c010cc95435e_1718865202762
 *                                  status: E
 *                                  description: null
 *                                  CARD_PAY_LINK: https://dev.adwa.world/ADPFO/BANK/ADWACARD?adpFootprint=GOSHENWATER_56964554A5E4C
 *          403:
 *              description: Forbiden
 *          500:
 *              description: Internal Server Error
 *          429:
 *              description: Too many requests
 */

paymentCollectionRoute.post(
  "/:orderId/paymentCollection/mobile",
  authCheck,
  validatePayment,
  mobilePaymentCollection,
);

/**
 * External payment confirmation: for API consumers who use their own provider
 * (Stripe, Flutterwave, M-Pesa, etc.). Body: orderId, amount, currency, externalPaymentId, optional provider.
 */
paymentCollectionRoute.post(
  "/payment/confirm-external",
  authCheck,
  confirmExternalPayment,
);

export default paymentCollectionRoute;
