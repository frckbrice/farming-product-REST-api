"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_routes_1 = tslib_1.__importDefault(require("./auth.routes"));
const user_routes_1 = tslib_1.__importDefault(require("./user.routes"));
const product_routes_1 = tslib_1.__importDefault(require("./product.routes"));
const review_routes_1 = tslib_1.__importDefault(require("./review.routes"));
const order_routes_1 = tslib_1.__importDefault(require("./order.routes"));
const payment_collection_routes_1 = tslib_1.__importDefault(require("./payment.collection.routes"));
const notification_routes_1 = tslib_1.__importDefault(require("./notification.routes"));
const models_1 = tslib_1.__importDefault(require("../models"));
const appRouter = express_1.default.Router();
console.log("\n\n from route index file: \n\n");
// Health check endpoint with database connection test
appRouter.get("/health", (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield models_1.default.authenticate();
        res.status(200).json({
            status: "success",
            message: "Farm Marketplace API is running",
            database: "connected",
            timestamp: new Date().toISOString(),
            version: "2.0.0",
        });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(503).json({
            status: "error",
            message: "Farm Marketplace API is running but database connection failed",
            database: "disconnected",
            timestamp: new Date().toISOString(),
            version: "2.0.0",
        });
    }
}));
appRouter.use("/auth", auth_routes_1.default);
appRouter.use("/users", user_routes_1.default);
appRouter.use("/products", product_routes_1.default);
appRouter.use("/reviews", review_routes_1.default);
appRouter.use("/orders", order_routes_1.default);
appRouter.use("/transactions", payment_collection_routes_1.default);
appRouter.use("/notifications", notification_routes_1.default);
exports.default = appRouter;
