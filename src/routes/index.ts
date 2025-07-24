import express, { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import productRouter from "./product.routes";
import reviewRouter from "./review.routes";
import orderRouter from "./order.routes";
import paymentCollectionRoute from "./payment.collection.routes";
import notificationRouter from "./notification.routes";

const appRouter: Router = express.Router();

console.log("\n\n from route index file: \n\n");
appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRoutes);
appRouter.use("/products", productRouter);
appRouter.use("/reviews", reviewRouter);
appRouter.use("/orders", orderRouter);
appRouter.use("/transactions", paymentCollectionRoute);
appRouter.use("/notifications", notificationRouter);

export default appRouter;
