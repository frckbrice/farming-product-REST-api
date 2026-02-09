"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDispatchDetails = exports.getTransaction = exports.updateOrder = exports.createOrder = exports.getSellerOrders = exports.getBuyerOrders = exports.getOrderById = void 0;
const tslib_1 = require("tslib");
const cloudinary_1 = require("cloudinary");
const fs = tslib_1.__importStar(require("fs"));
const errors_1 = require("../errors");
const orderService = tslib_1.__importStar(require("../services/order.service"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const getOrderById = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = yield orderService.getOrderById(req.params.orderId);
        res.status(200).json({ status: "success", order: orderData });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.getOrderById = getOrderById;
const getBuyerOrders = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const buyerOrders = yield orderService.getBuyerOrders(req.params.buyerId, req.query.orderStatus);
        res.status(200).json({ status: "success", ordersData: buyerOrders });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.getBuyerOrders = getBuyerOrders;
const getSellerOrders = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerOrders = yield orderService.getSellerOrders(req.params.sellerId, req.query.orderStatus, req.query.productName);
        res.status(200).json({ status: "success", ordersData: sellerOrders });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.getSellerOrders = getSellerOrders;
const createOrder = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const buyerId = (_b = (_a = req.userData) === null || _a === void 0 ? void 0 : _a.UserId) !== null && _b !== void 0 ? _b : "3ff1ceec-9f0d-4952-9c6c-fe3973dd8fa1";
        const result = yield orderService.createOrder(req.params.productId, req.body, buyerId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.createOrder = createOrder;
const updateOrder = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield orderService.updateOrder(req.params.orderId, req.body.userId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.updateOrder = updateOrder;
const getTransaction = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield orderService.getTransactionByOrderId(req.params.orderId);
        res.status(200).json({
            message: "Transaction Details",
            details: transaction,
        });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred",
        });
    }
});
exports.getTransaction = getTransaction;
const updateDispatchDetails = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { orderId } = req.params;
        const { method, date } = req.body;
        let imageUrl;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const upload = yield cloudinary_1.v2.uploader.upload(req.file.path, {
                resource_type: "image",
            });
            imageUrl = upload.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const result = yield orderService.updateDispatchDetails(orderId, {
            method,
            date,
            imageUrl,
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.updateDispatchDetails = updateDispatchDetails;
