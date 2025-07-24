"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// app.ts
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const express_1 = tslib_1.__importDefault(require("express"));
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const rateLimiter_1 = tslib_1.__importDefault(require("./src/middleware/rateLimiter"));
const routes_1 = tslib_1.__importDefault(require("./src/routes"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const errorHandler_1 = tslib_1.__importDefault(require("./src/middleware/errorHandler"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = tslib_1.__importDefault(require("swagger-jsdoc"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
// Define the server configuration
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.DB_HOST || "localhost";
const isDev = process.env.NODE_ENV !== "production";
dotenv_1.default.config();
const app = (0, express_1.default)();
// Swagger options
const doc = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Farming products API",
            version: "1.0.0",
            description: "API Documentation for Farming products",
            contact: {
                name: "Farming products",
            }
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Development on Local server",
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                // Reference your main models here for Swagger UI
                Product: {
                    type: "object",
                    required: ["productName", "productCat", "priceType", "price"],
                    properties: {
                        productName: { type: "string" },
                        productCat: { type: "string" },
                        priceType: { type: "string" },
                        price: { type: "number" },
                        description: { type: "string" },
                        wholeSale: { type: "boolean" },
                        imageUrl: { type: "string" },
                        userId: { type: "string" },
                    },
                    example: {
                        productName: "Tomato",
                        productCat: "Vegetable",
                        priceType: "per kg",
                        price: 1000,
                        description: "Fresh tomatoes",
                        wholeSale: false,
                        imageUrl: "https://cloudinary.com/image.jpg",
                        userId: "uuid-1234"
                    }
                },
                // Add more models as needed
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: isDev ? ["./src/routes/*.ts"] : ["./dist/routes/*.js"]
};
// Update this to '.ts' as files are converted to TypeScript
const swaggerSpec = (0, swagger_jsdoc_1.default)(doc);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(doc)));
const imagesDir = path_1.default.join(__dirname, "/src/public/images");
// Ensure the directory exists at app start
if (!fs_1.default.existsSync(imagesDir)) {
    fs_1.default.mkdirSync(imagesDir, { recursive: true });
}
// Middleware setup
app.use(rateLimiter_1.default);
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use("/public/images", express_1.default.static("public/images"));
// Routes setup
app.use("/api/v1", routes_1.default);
// @ts-ignore-next-line
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Swagger default route definition
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a greeting message
 *     responses:
 *       200:
 *         description: A simple greeting message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World!! Farming products_2"
 */
app.get("/", (req, res) => {
    res.send("Hello World!! Farming products_2");
});
// Error handling middleware
app.use(errorHandler_1.default);
app.listen(port, () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Server running on http${!isDev ? 's' : ''}://${!isDev ? process.env.DB_HOST : hostname}:${port} `);
    }
    catch (error) {
        console.error("Error running migrations:", error);
    }
}));
exports.default = app;
