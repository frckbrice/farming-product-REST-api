"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_check_1 = tslib_1.__importDefault(require("../middleware/auth-check"));
const multerStorage_1 = tslib_1.__importDefault(require("../middleware/multerStorage"));
const product_controller_1 = require("../controllers/product.controller");
const product_search_controller_1 = require("../controllers/product.search.controller");
const productRouter = express_1.default.Router();
productRouter.use(auth_check_1.default);
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
 * /user/product:
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
productRouter.get('/', product_search_controller_1.getAllProductSearch);
/**
 * @swagger
 * /user/product/{productId}:
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
productRouter.get('/:productId', product_controller_1.getProduct);
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
productRouter.get('/:userId/products', product_controller_1.userProducts);
/**
 * @swagger
 * /user/product/add:
 *  post:
 *      summary: add a new product
 *      tags: [Products]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          productName:
 *                              type: string
 *                          productCat:
 *                              type: string
 *                          priceType:
 *                              type: string
 *                          price:
 *                              type: integer
 *                          description:
 *                              type: string
 *                          wholeSale:
 *                              type: boolean
 *                          productImage:
 *                              type: string
 *                              format: binary
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
productRouter.post('/add', (0, multerStorage_1.default)('productImage'), product_controller_1.createProduct);
/**
 * @swagger
 * /user/product/update/{productId}:
 *  put:
 *      summary: updating product fields
 *      tags: [Products]
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
 *                          productName:
 *                              type: string
 *                          productCat:
 *                              type: string
 *                          priceType:
 *                              type: string
 *                          price:
 *                              type: integer
 *                          description:
 *                              type: string
 *      responses:
 *          200:
 *              description: OK
 *          403:
 *              description: Forbiden
 *          500:
 *              description: Internal Server Error
 *          429:
 *              description: Too many requests
 *
 */
productRouter.put('/:productId', (0, multerStorage_1.default)('productImage'), product_controller_1.updateProduct);
/**
 * @swagger
 * /user/product/remove/{productId}:
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
productRouter.delete('/:productId', product_controller_1.removeProduct);
exports.default = productRouter;
