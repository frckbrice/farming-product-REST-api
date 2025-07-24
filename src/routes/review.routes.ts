import express, { NextFunction, Request, Response, Router } from "express";
import authCheck from "../middleware/auth-check";
import {
  getReviewByProdId,
  createReview,
  updateReview,
  deleteOwnReview,
  orderReview,
} from "../controllers/review.controller";
import { z } from "zod";

const reviewSchema = z.object({
  comment: z.string().min(1),
  rating: z.number().min(1).max(5),
});

function validateReview(req: Request, res: Response, next: NextFunction) {
  const parsed = reviewSchema.safeParse({
    ...req.body,
    rating: req.body.rating ? Number(req.body.rating) : undefined,
  });
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  next();
}

const reviewRouter: Router = express.Router();

// reviewRouter.get('/:userId')

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
 *   name: Reviews
 *   description: API for managing user reviews
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BuyerReview:
 *       type: object
 *       required:
 *         - comment
 *         - rating
 *         - userId
 *         - prodId
 *         - orderId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the review
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         comment:
 *           type: string
 *           description: The review comment text
 *           example: The product was fresh and delivered on time. Excellent quality!
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given by the buyer (typically 1-5)
 *           example: 4.5
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created this review
 *           example: 550e8400-e29b-41d4-a716-446655440001
 *         prodId:
 *           type: string
 *           format: uuid
 *           description: ID of the product being reviewed
 *           example: 550e8400-e29b-41d4-a716-446655440002
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: ID of the order associated with this review
 *           example: 550e8400-e29b-41d4-a716-446655440003
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the review was created
 *           example: 2023-03-15T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the review was last updated
 *           example: 2023-03-16T14:30:00Z
 */

/**
 * @swagger
 * /user/review/{orderId}:
 *  get:
 *      summary: get a review of an order
 *      tags: [Reviews]
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

// get review of an order
reviewRouter.get("/:orderId", authCheck, orderReview);

/**
 * @swagger
 * /user/review/{productId}:
 *  get:
 *      summary: All reviews of a product
 *      tags: [Reviews]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *              type: string
 *          required: true
 *        - in: query
 *          name: rating
 *          schema:
 *              type: string
 *          required: false
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

reviewRouter.get("/:productId", authCheck, getReviewByProdId);

/**
 * @swagger
 * /user/review/{productId}/${orderId}/add:
 *  post:
 *      summary: Add review to a product
 *      tags: [Reviews]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *              type: string
 *          required: true
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
 *                          comment:
 *                              type: string
 *                          rating:
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

reviewRouter.post("/:productId/:orderId/add", validateReview, createReview);

/**
 * @swagger
 * /user/review/{reviewId}/update:
 *  put:
 *      summary: Update review to a product
 *      tags: [Reviews]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: reviewId
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
 *                          comment:
 *                              type: string
 *                          rating:
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
reviewRouter.put("/:reviewId/update", validateReview, updateReview);

/**
 * @swagger
 * /user/review/{reviewId}/remove:
 *  delete:
 *      summary: Delete review to a product
 *      tags: [Reviews]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: reviewId
 *          schema:
 *              type: string
 *          required: true
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
reviewRouter.delete("/:reviewId/remove", authCheck, deleteOwnReview);

export default reviewRouter;
