import express, { Router } from "express";
import {
  verifyPhone,
  register_user,
  logIn,
  verifyOtp,
  authHandler,
  sendNewOTP,
  refreshToken,
} from "../controllers/auth.controller";

const authRouter: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication, registration, and JWT management
 */
// signup
/**
 * @swagger
 * /auth/signup:
 *  post:
 *    summary: phone verification api
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              userRole:
 *                type: string
 *              phoneNum:
 *                type: string
 *              country:
 *                type: string
 *
 *
 *    responses:
 *      200:
 *        description: The OTP sent successfully
 *
 *      500:
 *        description: Some server error
 *
 */
authRouter.post("/signup", verifyPhone);

// verify OTP

/**
 * @swagger
 * /auth/verifyOTP:
 *  post:
 *    summary: phone verification api
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              otp:
 *                type: string
 *    responses:
 *      200:
 *        description: The OTP sent successfully
 *
 *      500:
 *        description: Some server error
 *
 */
authRouter.post("/verifyOTP", verifyOtp);

// user registration

/**
 * @swagger
 * /auth/signup/{userId}:
 *  put:
 *    summary: phone verification api
 *    tags: [Authentication]
 *    parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *          type: string
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              address:
 *                type: string
 *              profileImage:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: The book sent successfully
 *
 *      500:
 *        description: Some server error
 *
 */
authRouter.put("/signup/:userId", register_user);

// login

/**
 * @swagger
 * /auth/login:
 *  get:
 *    summary: log in
 *    tags: [Authentication]
 *   requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *    responses:
 *      200:
 *        description: OK
 *      500:
 *        description: Internal Server Error
 */
authRouter.post("/login", logIn);

// send OTP

/**
 * @swagger
 * /auth/sendOTP:
 *  post:
 *    summary: phone verification api
 *    tags: [Authentication]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *    responses:
 *      200:
 *        description: The OTP sent successfully
 *
 *      500:
 *        description: Some server error
 *
 */
authRouter.post("/sendOTP/", sendNewOTP);

// oAuth

/**
 * @swagger
 * /auth/signup/oAuth:
 *   post:
 *     summary: Authenticate using Google or Facebook OAuth
 *     tags: [Authentication]
 *     description: Authenticates a user using either a Google token or Facebook token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *               facebookToken:
 *                 type: string
 *                 description: Facebook access token
 *             example:
 *               googleToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOTczZWUyZT..."
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://lh3.googleusercontent.com/a/user_photo"
 *                     roleId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c86"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing authentication token"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Google token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User creation failed. Please try again."
 */
authRouter.post("/signup/oAuth", authHandler);

// refresh token to generate access token
/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Generates a new access token using the refresh token provided in the Authorization header
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *                 message:
 *                   type: string
 *                   description: the success message
 *               example:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 message: Token refreshed successfully...
 *       401:
 *         description: Expired or invalid refresh token
 *       403:
 *         description: Forbidden - token has been invalidated
 */
authRouter.post("/refreshToken", refreshToken);

export default authRouter;
