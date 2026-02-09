import express, { NextFunction, Request, Response, Router } from "express";
import authCheck from "../middleware/auth-check";
import uploadMiddleware from "../middleware/multerStorage";
import {
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  userProducts,
} from "../controllers/product.controller";
import { getAllProductSearch } from "../controllers/product.search.controller";
import { z } from "zod";

const productSchema = z.object({
  productName: z.string().min(1),
  productCat: z.string().min(1),
  priceType: z.string().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  wholeSale: z.boolean().optional(),
});

function validateProduct(req: Request, res: Response, next: NextFunction) {
  const data = req.body;
  // If using multer, req.body fields may be strings, so coerce as needed
  const parsed = productSchema.safeParse({
    ...data,
    price: data.price ? Number(data.price) : undefined,
    wholeSale: data.wholeSale === "true" || data.wholeSale === true,
  });
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }
  next();
}

const productRouter: Router = express.Router();

productRouter.use(authCheck);

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
 *   name: Products
 *   description: API for managing user products
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the product
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         productName:
 *           type: string
 *           description: Name of the product
 *           example: Organic Fresh Tomatoes
 *         productCat:
 *           type: string
 *           description: Category of the product
 *           example: Vegetables
 *         priceType:
 *           type: string
 *           description: Type of pricing (e.g., per kg, per piece)
 *           example: per kg
 *         price:
 *           type: number
 *           format: float
 *           description: Price of the product
 *           example: 1500
 *         imageUrl:
 *           type: string
 *           description: URL to the product image
 *           example: https://farmingproducts-storage.com/images/tomatoes.jpg
 *         description:
 *           type: string
 *           description: Detailed description of the product
 *           example: Fresh, locally grown organic tomatoes from our partner farms
 *         wholeSale:
 *           type: boolean
 *           description: Indicates if the product is available for wholesale
 *           example: false
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who created/owns this product
 *           example: 550e8400-e29b-41d4-a716-446655440001
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was created
 *           example: 2023-03-15T12:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was last updated
 *           example: 2023-03-16T14:30:00Z
 */

/**
 * @swagger
 * /products:
 *  get:
 *      summary: Search product using query parameters
 *      tags: [Products]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: productName
 *          schema:
 *              type: string
 *          required: false
 *        - in: query
 *          name: productCat
 *          schema:
 *              type: string
 *          required: false
 *        - in: query
 *          name: page
 *          schema:
 *              type: integer
 *          required: false
 *        - in: query
 *          name: limit
 *          schema:
 *              type: integer
 *          required: false
 *        - in: query
 *          name: minPrice
 *          schema:
 *              type: integer
 *          required: false
 *        - in: query
 *          name: maxPrice
 *          schema:
 *              type: integer
 *          required: false
 *      responses:
 *          200:
 *              description: Success. getting all products or products on the basis of search query
 *          500:
 *              description: Server Error
 *          403:
 *              description: Forbidden
 *
 */

productRouter.get("/", getAllProductSearch);

/**
 * @swagger
 * /products/{productId}:
 *  get:
 *      summary: getting a product based on its ID
 *      tags: [Products]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          schema:
 *              type: string
 *          required: true
 *      responses:
 *          200:
 *              description: Ok. a product Data based on the product ID
 *          403:
 *              description: Forbiden
 *          500:
 *              description: Server Error
 */
productRouter.get("/:productId", getProduct);

/**
 * @swagger
 * /user/product/{userId}/products:
 *  get:
 *      summary: all products of the user
 *      tags: [Products]
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
 *              description: OK. products of a user
 *          500:
 *              description: Server Error
 *          403:
 *              description: Forbiden
 *          429:
 *              description: Too many Requests
 */
productRouter.get("/:userId/products", userProducts);

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Add a new product (with image upload)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productCat
 *               - priceType
 *               - price
 *               - productImage
 *             properties:
 *               productName:
 *                 type: string
 *               productCat:
 *                 type: string
 *               priceType:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               wholeSale:
 *                 type: boolean
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *                   example: { productName: ["Required"], price: ["Must be a number"] }
 *       500:
 *         description: Internal Server Error
 */

productRouter.post(
  "/add",
  uploadMiddleware("productImage"),
  validateProduct,
  createProduct,
);

/**
 * @swagger
 * /user/product/update/{productId}:
 *   put:
 *     summary: Update product fields (with image upload)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               productName:
 *                 type: string
 *               productCat:
 *                 type: string
 *               priceType:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               wholeSale:
 *                 type: boolean
 *               productImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *                   example: { productName: ["Required"], price: ["Must be a number"] }
 *       500:
 *         description: Internal Server Error
 */
productRouter.put(
  "/:productId",
  uploadMiddleware("productImage"),
  validateProduct,
  updateProduct,
);

/**
 * @swagger
 * /products/{productId}:
 *  delete:
 *      summary: Caution! removing a product by the user
 *      tags: [Products]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: productId
 *          required: true
 *          schema:
 *              type: string
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
productRouter.delete("/:productId", removeProduct);

export default productRouter;
