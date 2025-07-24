// app.ts
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import limiter from "./src/middleware/rateLimiter";
import appRouter from "./src/routes";
import cors from "cors";
import path from "path";
import fs from "fs";
import errorHandler from "./src/middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import helmet from "helmet";

// Define the server configuration
const port: number = parseInt(process.env.PORT || "3000", 10);
const hostname: string = process.env.DB_HOST || "localhost";

const isDev = process.env.NODE_ENV !== "production";

dotenv.config();

const app: Application = express();

// Swagger options
const doc: any = {
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
const swaggerSpec = swaggerJsDoc(doc);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(doc)));

const imagesDir = path.join(__dirname, "/src/public/images");

// Ensure the directory exists at app start
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Middleware setup
app.use(limiter);
app.set("trust proxy", 1);
app.use(helmet());

app.use(bodyParser.json());
app.use(cors());
app.use("/public/images", express.static("public/images"));

// Routes setup
app.use("/api/v1", appRouter);

// @ts-ignore-next-line
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!! Farming products_2");
});

// Error handling middleware
app.use(errorHandler);



app.listen(port, async () => {

  try {
    console.log(`Server running on http${!isDev ? 's' : ''}://${!isDev ? process.env.DB_HOST : hostname}:${port} `);
  } catch (error) {
    console.error("Error running migrations:", error);
  }
});

export default app;
