"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_check_1 = tslib_1.__importDefault(require("../middleware/auth-check"));
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.use(auth_check_1.default);
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         userId:
 *           type: string
 *           description: The user ID this notification belongs to
 *         title:
 *           type: string
 *           description: The title of the notification
 *         message:
 *           type: string
 *           description: The content of the notification
 *         isRead:
 *           type: boolean
 *           description: Indicates if the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the notification was created
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
 *   name: Notifications
 *   description: API for managing user notifications
 */
/**
 * @swagger
 * /notifications/create/{userId}:
 *   post:
 *     summary: Create a new notification for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *             example:
 *               title: "Order Update"
 *               message: "Your order has been shipped"
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */
notificationRouter.post('/create/:userId', notification_controller_1.createNotification);
/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: List of notifications for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifiations:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     rows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c85"
 *                           userId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c86"
 *                           title:
 *                             type: string
 *                             example: "New Order"
 *                           message:
 *                             type: string
 *                             example: "Your order has been received"
 *                           isRead:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-01-10T04:05:06.157Z"
 *                           User:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "60d21b4667d0d8992e610c86"
 *                               firstName:
 *                                 type: string
 *                                 example: "John"
 *                               lastName:
 *                                 type: string
 *                                 example: "Doe"
 *                               country:
 *                                 type: string
 *                                 example: "Cameroon"
 *                               verifiedUser:
 *                                 type: boolean
 *                                 example: true
 *       500:
 *         description: Server error
 */
notificationRouter.get('/:userId', notification_controller_1.getNotification);
/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The notification id
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "success"
 *       500:
 *         description: Server error
 */
notificationRouter.put('/:id', notification_controller_1.markAsRead);
// test expo notification
/**
 * @swagger
 * /notifications/{userId}/test:
 *   get:
 *     summary: Send a test push notification to user's device
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: Test notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   description: Response from Expo push notification service
 *       500:
 *         description: Server error
 */
notificationRouter.get('/:userId/test', notification_controller_1.testExpoNotification);
exports.default = notificationRouter;
