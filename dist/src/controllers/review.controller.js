"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderReview = exports.deleteOwnReview = exports.updateReview = exports.createReview = exports.getReviewByProdId = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const order_1 = tslib_1.__importDefault(require("../models/order"));
const sequelize_1 = require("sequelize");
const send_notification_1 = tslib_1.__importDefault(require("../middleware/send-notification"));
const handleExpoResponse_1 = tslib_1.__importDefault(require("../middleware/handleExpoResponse"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Get review of an order
const orderReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderReview = yield buyerreview_1.default.findOne({
            where: { orderId: req.params.orderId },
            include: [
                {
                    model: user_1.default,
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: product_1.default,
                    attributes: ["id", "productName", "productCat", "imageUrl"],
                },
            ],
        });
        if (!orderReview) {
            throw new customErrors_1.default("Review not found for this order", 404);
        }
        res.status(200).json({
            status: "success",
            orderReviewData: orderReview,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving order review"
        });
    }
});
exports.orderReview = orderReview;
// Get reviews of a product
const getReviewByProdId = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const whereClause = {
            prodId: req.params.productId,
        };
        const { rating } = req.query;
        if (rating === null || rating === void 0 ? void 0 : rating.trim()) {
            const ratingNum = Number(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                throw new customErrors_1.default("Invalid rating value. Must be between 1 and 5", 400);
            }
            whereClause.rating = {
                [sequelize_1.Op.eq]: ratingNum,
            };
        }
        const reviews = yield buyerreview_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: product_1.default,
                    attributes: ["id", "productName", "productCat", "imageUrl"],
                },
            ],
        });
        if (!reviews.count) {
            res.status(200).json({
                message: "No reviews found for this product",
                reviews,
            });
            return;
        }
        res.status(200).json({ reviews });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving product reviews"
        });
    }
});
exports.getReviewByProdId = getReviewByProdId;
// Create a review
const createReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userData || typeof req.userData === 'string') {
            throw new customErrors_1.default("Invalid authentication token", 401);
        }
        const { rating, comment } = req.body;
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new customErrors_1.default("Rating must be between 1 and 5", 400);
        }
        // Validate comment
        if (!(comment === null || comment === void 0 ? void 0 : comment.trim())) {
            throw new customErrors_1.default("Comment is required", 400);
        }
        const order = yield order_1.default.findOne({ where: { id: req.params.orderId } });
        if (!order) {
            throw new customErrors_1.default("Order not found", 404);
        }
        if (order.status !== "delivered") {
            throw new customErrors_1.default("The order is still in processing or pending state. You cannot review yet", 401);
        }
        const reviewData = {
            prodId: req.params.productId,
            userId: req.userData.UserId,
            orderId: req.params.orderId,
            rating,
            comment,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const reviewOrder = { rating, comment };
        yield buyerreview_1.default.create(reviewData);
        yield order_1.default.update({
            review: reviewOrder,
            updatedAt: new Date()
        }, { where: { id: req.params.orderId } });
        const sellerData = yield user_1.default.findByPk(order.sellerId);
        if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
            const notificationMessage = {
                title: "Order Reviewed",
                message: "You got a review on your order from the buyer",
            };
            const pushMessage = {
                title: notificationMessage.title,
                text: notificationMessage.message
            };
            const result = yield (0, send_notification_1.default)(sellerData.expoPushToken, pushMessage);
            if (result && 'status' in result) {
                yield (0, handleExpoResponse_1.default)(result, order.sellerId, notificationMessage);
            }
        }
        res.status(201).json({ message: "Review added successfully" });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error creating review"
        });
    }
});
exports.createReview = createReview;
// Update a review
const updateReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rating, comment } = req.body;
        // Validate rating if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            throw new customErrors_1.default("Rating must be between 1 and 5", 400);
        }
        // Validate comment if provided
        if (comment !== undefined && !comment.trim()) {
            throw new customErrors_1.default("Comment cannot be empty", 400);
        }
        const review = yield buyerreview_1.default.findByPk(req.params.reviewId);
        if (!review) {
            throw new customErrors_1.default("Review not found", 404);
        }
        const [updatedCount] = yield buyerreview_1.default.update(Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { where: { id: req.params.reviewId } });
        if (updatedCount === 0) {
            throw new customErrors_1.default("Failed to update review", 500);
        }
        res.status(200).json({ message: "Review updated successfully" });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error updating review"
        });
    }
});
exports.updateReview = updateReview;
// Delete own review
const deleteOwnReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userData || typeof req.userData === 'string') {
            throw new customErrors_1.default("Invalid authentication token", 401);
        }
        const review = yield buyerreview_1.default.findOne({
            where: { id: req.params.reviewId },
            include: [
                {
                    model: user_1.default,
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
            ],
        });
        if (!review) {
            throw new customErrors_1.default("Review not found", 404);
        }
        if (review.userId !== req.userData.UserId) {
            throw new customErrors_1.default("You are not authorized to delete this review", 403);
        }
        const deletedCount = yield buyerreview_1.default.destroy({
            where: { id: req.params.reviewId }
        });
        if (deletedCount === 0) {
            throw new customErrors_1.default("Failed to delete review", 500);
        }
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting review"
        });
    }
});
exports.deleteOwnReview = deleteOwnReview;
