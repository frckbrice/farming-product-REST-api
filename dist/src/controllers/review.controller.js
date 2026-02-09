"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOwnReview = exports.updateReview = exports.createReview = exports.getReviewByProdId = exports.orderReview = void 0;
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const reviewService = tslib_1.__importStar(require("../services/review.service"));
const orderReview = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderReviewData = yield reviewService.getReviewByOrderId(req.params.orderId);
        res.status(200).json({
            status: "success",
            orderReviewData,
        });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error
                ? error.message
                : "Error retrieving order review",
        });
    }
});
exports.orderReview = orderReview;
const getReviewByProdId = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield reviewService.getReviewsByProductId(req.params.productId, req.query.rating);
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
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error
                ? error.message
                : "Error retrieving product reviews",
        });
    }
});
exports.getReviewByProdId = getReviewByProdId;
const createReview = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userData || typeof req.userData === "string") {
            throw new errors_1.AppError("Invalid authentication token", 401);
        }
        const result = yield reviewService.createReview(req.params.productId, req.params.orderId, req.userData.UserId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error creating review",
        });
    }
});
exports.createReview = createReview;
const updateReview = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield reviewService.updateReview(req.params.reviewId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error updating review",
        });
    }
});
exports.updateReview = updateReview;
const deleteOwnReview = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userData || typeof req.userData === "string") {
            throw new errors_1.AppError("Invalid authentication token", 401);
        }
        yield reviewService.deleteReview(req.params.reviewId, req.userData.UserId);
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting review",
        });
    }
});
exports.deleteOwnReview = deleteOwnReview;
