import express, { NextFunction, Request, Response, Router } from "express";
import authCheck from "../middleware/auth-check";
import {
  getOrderById,
  createOrder,
  updateOrder,
  getBuyerOrders,
  getSellerOrders,
  getTransaction,
  updateDispatchDetails,
} from "../controllers/order.controller";
import uploadMiddleware from "../middleware/multerStorage";
import { z } from "zod";

const orderSchema = z.object({
  shipAddress: z.string().min(1),
  weight: z.string().min(1),
  sellerId: z.string().uuid(),
  amount: z.number().min(1),
});

function validateOrder(req: Request, res: Response, next: NextFunction) {
  const parsed = orderSchema.safeParse({
    ...req.body,
    amount: req.body.amount ? Number(req.body.amount) : undefined,
  });
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  next();
}

const orderRouter: Router = express.Router();

orderRouter.use(authCheck);
/**
 * @swagger
 * components:
 *   schemas:
 *     order:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the order
 *         buyerId:
 *           type: string
 *           description: The user ID for the buyer of this order belongs to
 *         sellerId:
 *           type: string
 *           description: The user ID for the seller of this order belongs to
 *         amoount:
 *           type: string
 *           description: The amount of the order
 *         weight:
 *           type: string
 *           description: The weight of the order
 *         review:
 *           type: object
 *           description: Indicates the review made for the order.
 *         status:
 *           type: string
 *           description: The status of the order
 *         dispatchDetails:
 *           type: any
 *           description: The dispatch details of the order
 *         dispatched:
 *           type: boolean
 *           description: Indicates if the order has been dispatched
 *         deliveryDate:
 *           type: Date
 *           description: The delivery date of the order
 *         prodId:
 *           type: string
 *           description: The product ID of the order
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the order was updated
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         userId: 60d21b4667d0d8992e610c86
 *         title: New Order
 *         message: Your order has been received
 *         isRead: false
 *         createdAt: 2023-01-10T04:05:06.157Z
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API for managing user orders
 */

/**
 * @swagger
 * /user/order/buyer/{buyerId}:
 *  get:
 *      summary: all order of a buyer
 *      tags: [Orders]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: buyerId
 *          schema:
 *              type: string
 *          required: true
 *        - in: query
 *          name: orderStatus
 *          schema:
 *              type: string
 *          required: false
 *      responses:
 *          200:
 *              description: Ok. a product Data based on the product ID
 *          401:
 *              description: Forbiden or unauthorized
 *          500:
 *              description: Server Error
 */
// get all orders of the buyer with query parameter of status
orderRouter.get("/buyer/:buyerId", getBuyerOrders);

/**
 * @swagger
 * /user/order/seller/{sellerId}:
 *  get:
 *      summary: all order of a seller
 *      tags: [Orders]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: sellerId
 *          schema:
 *              type: string
 *          required: true
 *        - in: query
 *          name: orderStatus
 *          schema:
 *              type: string
 *          required: false
 *      responses:
 *          200:
 *              description: Ok. a product Data based on the product ID
 *          401:
 *              description: Forbiden or unauthorized
 *          500:
 *              description: Server Error
 */

// get all orders of the seller with query parameter of status
orderRouter.get("/seller/:sellerId", getSellerOrders);

/**
 * @swagger
 * /user/order/{orderId}:
 *  get:
 *      summary: fetching an order using ID
 *      tags: [Orders]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: orderId
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Ok. a product Data based on the product ID
 *          401:
 *              description: Forbiden or unauthorized
 *          500:
 *              description: Server Error
 */

orderRouter.get("/:orderId", getOrderById);

/**
 * @swagger
 * /user/order/new/{productId}:
 *  post:
 *      summary: Place an order to the product
 *      tags: [Orders]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
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
 *                          shipAddress:
 *                              type: string
 *                          weight:
 *                              type: string
 *                          sellerId:
 *                              type: string
 *                          amount:
 *                              type: integer
 *
 *      responses:
 *          200:
 *              description: OK
 *          403:
 *              description: Forbiden
 *          500:
 *              description: Internal Server Error
 *          429:
 *              description: Too many requests
 */
orderRouter.post("/new/:productId", validateOrder, createOrder);

/**
 * @swagger
 * /user/order/{orderId}/complete:
 *  put:
 *      summary: Make the order status as complete
 *      tags: [Orders]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: orderId
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: OK
 *          403:
 *              description: Forbiden
 *          500:
 *              description: Internal Server Error
 *          429:
 *              description: Too many requests
 */
orderRouter.put("/:orderId/complete", updateOrder);

orderRouter.put(
  "/:orderId/dispatch",
  uploadMiddleware("dispatchImage"),
  updateDispatchDetails,
);

orderRouter.get("/:orderId/transaction", getTransaction);

export default orderRouter;
