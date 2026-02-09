// app.ts — env must load first so CLOUDINARY_URL is valid before cloudinary SDK loads
import "./src/env";
import express, { Application, Request, Response, NextFunction } from "express";
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
import { AppError } from "./src/errors";

// Define the server configuration
const port: number = parseInt(process.env.PORT || "5002", 10);
const hostname: string = process.env.DB_HOST || "localhost";

const isDev = process.env.NODE_ENV !== "production";

// Resolve project root so public/ works in both dev (__dirname = project root) and prod (__dirname = dist)
const projectRoot = __dirname.endsWith(path.sep + "dist") ? path.join(__dirname, "..") : __dirname;

const app: Application = express();

// Base URL for API docs (same origin as server)
const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

// Swagger options — platform for farmers and customers
const doc: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Farm Marketplace API",
      version: "2.0.0",
      description: `**Farm Marketplace API** is the central platform that connects **farmers** (sellers) with **customers** (buyers) for farm products.

**Who consumes this API**  
This API is intended to be consumed by **client applications** only — for example, a **web app** or a **mobile app**. The API runs on the server; it does not run on or access mobile devices. Only clients that you build (web or mobile) can call this API.

## For Farmers
- Register as a farmer, list your products, set prices (per kg, per unit, wholesale).
- Manage product catalog, update/remove listings, and handle orders from buyers.
- Receive and manage orders, update dispatch details, and get buyer reviews.

## For Customers
- Browse and search products by name, category, and price range.
- Place orders, manage shipping addresses, and pay via integrated transactions.
- Leave reviews for farmers and track order status.

## Security (enforced in the API)
Security is enforced **in the code** on the server: protected routes require a valid JWT and ownership/role checks are applied where required.
- **Authentication**: JWT Bearer tokens; use \`Authorization: Bearer <token>\` for protected routes.
- **Authorization**: Role-based access (farmer vs buyer); resource ownership checks (e.g. only product owner can update/delete).
- **Rate limiting**: Global rate limit per IP to prevent abuse (see 429 responses).
- **Input validation**: Request bodies validated (e.g. Zod); invalid payloads return 400 with field errors.
- **Helmet**: Security headers (X-Content-Type-Options, X-Frame-Options, etc.) applied to all responses.
- **HTTPS**: Use HTTPS in production; tokens and credentials must not be sent over plain HTTP.`,
      contact: {
        name: "Farm Marketplace API",
      },
    },
    servers: [
      { url: `${apiBaseUrl}/api/v2`, description: "Current server (development or production)" },
      { url: "http://localhost:5002/api/v2", description: "Local default (port 5002)" },
    ],
    tags: [
      { name: "Authentication", description: "Sign up, login, JWT refresh — for both farmers and customers (OTP disabled; keeping auth simple)" },
      { name: "Products", description: "Product catalog — farmers list/sell; customers browse/search" },
      { name: "Orders", description: "Orders — customers place; farmers fulfill and dispatch" },
      { name: "Reviews", description: "Buyer reviews — customers review farmers/sellers" },
      { name: "User profile", description: "Profile and avatar — all authenticated users" },
      { name: "Payment Collection", description: "Payments — customers pay for orders" },
      { name: "Notifications", description: "Push notifications — optional for clients (e.g. web or mobile)" },
      { name: "Health", description: "Health check — API and database status for monitoring" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Obtain token via POST /auth/login. Send as: Authorization: Bearer <accessToken>",
        },
      },
      schemas: {
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
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns API and database status. Use for monitoring, load balancers, and uptime checks. No authentication required.",
          operationId: "getHealth",
          security: [],
          responses: {
            "200": {
              description: "API and database are running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      message: { type: "string", example: "Farm Marketplace API is running" },
                      database: { type: "string", example: "connected" },
                      timestamp: { type: "string", format: "date-time" },
                      version: { type: "string", example: "2.0.0" },
                    },
                  },
                },
              },
            },
            "503": {
              description: "API is up but database connection failed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "error" },
                      database: { type: "string", example: "disconnected" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // In production, compiled routes live at dist/src/routes/*.js (tsc preserves src/ under outDir)
  apis: isDev
    ? [path.join(projectRoot, "src", "routes", "*.ts")]
    : [path.join(projectRoot, "dist", "src", "routes", "*.js")],
};

// Update this to '.ts' as files are converted to TypeScript
const swaggerSpec = swaggerJsDoc(doc);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(doc)));

const imagesDir = path.join(projectRoot, "public", "assets", "images");

// Ensure the directory exists at app start
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Middleware setup
app.use(limiter);
app.set("trust proxy", 1);
// Allow Unsplash images (hero bg, cards, etc.) — default CSP blocks external img-src
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(bodyParser.json());
app.use(cors());
app.use("/public", express.static(path.join(projectRoot, "public")));
app.use("/public/assets", express.static(path.join(projectRoot, "public", "assets")));
app.use("/public/assets/images", express.static(path.join(projectRoot, "public", "assets", "images")));

// Routes setup
app.use("/api/v2", appRouter);

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
 *                   example: "Hello World!! Farming products"
 */
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, "public", "index.html"));
});

// 404 handler - serve custom 404 page for HTML requests, JSON for API requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Check if the request is for an API endpoint or expects JSON
  const isAPIRequest = req.path.startsWith('/api/v2') || req.get('Accept')?.includes('application/json');

  if (isAPIRequest) {
    // For API requests, return JSON error
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
  } else {
    // For web requests, serve the custom 404 page
    res.status(404).sendFile(path.join(projectRoot, "public", "404.html"));
  }
});

// Error handling middleware - must be last
app.use(errorHandler);

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    try {
      console.log("✅ Database is up to date.");
    } catch (error) {
      console.error("❌ Unable to connect to the database:", error);
    }
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

export default app;
