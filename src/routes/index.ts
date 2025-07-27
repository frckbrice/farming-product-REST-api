import express, { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRouter from "./product.routes";
import reviewRouter from "./review.routes";
import orderRouter from "./order.routes";
import paymentCollectionRoute from "./payment.collection.routes";
import notificationRouter from "./notification.routes";
import sequelize from "../models";

const appRouter: Router = express.Router();

console.log("\n\n from route index file: \n\n");

// Health check endpoint with database connection test
appRouter.get("/health", async (req, res) => {
    try {
        // Test database connection
        await sequelize.authenticate();

        res.status(200).json({
            status: "success",
            message: "Farming Products API is running",
            database: "connected",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(503).json({
            status: "error",
            message: "Farming Products API is running but database connection failed",
            database: "disconnected",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    }
});

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/products", productRouter);
appRouter.use("/reviews", reviewRouter);
appRouter.use("/orders", orderRouter);
appRouter.use("/transactions", paymentCollectionRoute);
appRouter.use("/notifications", notificationRouter);

export default appRouter;
