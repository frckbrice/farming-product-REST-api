"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_check_1 = tslib_1.__importDefault(require("../middleware/auth-check"));
const user_controller_1 = require("../controllers/user.controller");
const multerStorage_1 = tslib_1.__importDefault(require("../middleware/multerStorage"));
const zod_1 = require("zod");
const userRouter = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: User profile
 *   description: API for managing user profile
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - address
 *         - shipAddress
 *         - country
 *         - imageUrl
 *         - googleId
 *         - facebookId
 *         - phoneNum
 *         - roleId
 *         - vip
 *         - verifiedUser
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the user
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         address:
 *           type: string
 *           description: User's primary address
 *           example: 123 Main Street, Douala
 *         shipAddress:
 *           type: array
 *           description: List of user's shipping addresses
 *           items:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: 456 Shipping Ave, Yaounde
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *         country:
 *           type: string
 *           description: User's country
 *           example: Cameroon
 *         imageUrl:
 *           type: string
 *           description: URL to user's profile image
 *           example: https://farmingproducts-storage.com/profiles/john-doe.jpg
 *         googleId:
 *           type: string
 *           description: Google OAuth ID (if user signed up with Google)
 *           example: 118234546580958341234
 *         facebookId:
 *           type: string
 *           description: Facebook OAuth ID (if user signed up with Facebook)
 *           example: 10229876543210987
 *         phoneNum:
 *           type: number
 *           description: User's phone number
 *           example: 237612345678
 *         roleId:
 *           type: string
 *           format: uuid
 *           description: ID of the user's role
 *           example: 550e8400-e29b-41d4-a716-446655440001
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (hashed)
 *           example: null
 *         expoPushToken:
 *           type: string
 *           description: Token for push notifications
 *           example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *         vip:
 *           type: boolean
 *           description: Indicates if the user has VIP status
 *           example: false
 *         verifiedUser:
 *           type: boolean
 *           description: Indicates if the user's identity has been verified
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *           example: 2023-03-15T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was last updated
 *           example: 2023-03-16T14:30:00Z
 */
// Zod schema for updatePassword endpoint
const updatePasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    userId: zod_1.z.string().uuid("Invalid userId format"),
});
function validateUpdatePassword(req, res, next) {
    const result = updatePasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    next();
}
// update user password
/**
 * @swagger
 * /user/updatePassword/:
 *  put:
 *      summary: api to update user password
 *      tags: [User profile]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          password:
 *                              type: string
 *                          userId:
 *                              type: string
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: Server Error
 *
 */
userRouter.put("/updatePassword/", validateUpdatePassword, user_controller_1.updatePassword);
// apply the auth middleware to all the routes below
userRouter.use(auth_check_1.default);
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
 * /user:
 *  get:
 *      summary: get all users
 *      tags: [User profile]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: server error
 */
userRouter.get("/", user_controller_1.getAllUserData);
/**
 * @swagger
 * /user/{userId}:
 *  get:
 *      summary: get logged a user data
 *      tags: [User profile]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: server error
 */
userRouter.get("/:userId", user_controller_1.getUserData);
/**
 * @swagger
 * /user/{userId}:
 *   put:
 *     summary: Update user profile (with image upload)
 *     tags: [User profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               address:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *                   example: { firstName: ["Required"] }
 *       500:
 *         description: Internal Server Error
 */
userRouter.put("/:userId", (0, multerStorage_1.default)("profileImage"), user_controller_1.updateUser);
/**
 * @swagger
 * /user/{userId}/shipAddress:
 *  put:
 *      summary: api to update user shipping address
 *      tags: [User profile]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *              type: string
 *          required: true
 *      requestBody:
 *          required: true
 *          content:
 *            application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          shipAddress:
 *                              type: string
 *
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: Server Error
 *
 */
userRouter.put("/:userId/shipAddress", user_controller_1.updateShipAddress);
/**
 * @swagger
 * /user/{userId}/expoPushToken:
 *  put:
 *      summary: api to update user data via expo push token
 *      tags: [User profile]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *              type: string
 *          required: true
 *      requestBody:
 *          required: true
 *          content:
 *             application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          expoPushToken:
 *                              type: string
 *
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: Server Error
 *
 */
userRouter.put("/:userId/expoPushToken", user_controller_1.addExpoPushNotificationToken);
/**
 * @swagger
 * /user/{userId}:
 *  delete:
 *      summary: Caution!! Deleting Profile
 *      tags: [User profile]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: OK
 *          500:
 *              description: Server error
 */
userRouter.delete("/:userId", user_controller_1.deleteUser);
exports.default = userRouter;
