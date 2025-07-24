"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_check_1 = tslib_1.__importDefault(require("../middleware/auth-check"));
const order_controller_1 = require("../controllers/order.controller");
const multerStorage_1 = tslib_1.__importDefault(require("../middleware/multerStorage"));
const orderRouter = express_1.default.Router();
orderRouter.use(auth_check_1.default);
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
orderRouter.get('/buyer/:buyerId', order_controller_1.getBuyerOrders);
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
orderRouter.get('/seller/:sellerId', order_controller_1.getSellerOrders);
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
orderRouter.get('/:orderId', order_controller_1.getOrderById);
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
orderRouter.post('/new/:productId', order_controller_1.createOrder);
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
orderRouter.put('/:orderId/complete', order_controller_1.updateOrder);
orderRouter.put('/:orderId/dispatch', (0, multerStorage_1.default)('dispatchImage'), order_controller_1.updateDispatchDetails);
orderRouter.get('/:orderId/transaction', order_controller_1.getTransaction);
exports.default = orderRouter;
