"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDispatchDetails = exports.getTransaction = exports.updateOrder = exports.createOrder = exports.getSellerOrders = exports.getBuyerOrders = exports.getOrderById = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const order_1 = tslib_1.__importDefault(require("../models/order"));
const transaction_1 = tslib_1.__importDefault(require("../models/transaction"));
const models_1 = tslib_1.__importDefault(require("../models"));
const sequelize_1 = require("sequelize");
const cloudinary_1 = require("cloudinary");
const fs = tslib_1.__importStar(require("fs"));
const send_notification_1 = tslib_1.__importDefault(require("../middleware/send-notification"));
const handleExpoResponse_1 = tslib_1.__importDefault(require("../middleware/handleExpoResponse"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Configure cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Get order by ID
const getOrderById = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderData = yield order_1.default.findOne({
            where: { id: req.params.orderId },
            include: [
                {
                    model: user_1.default,
                    as: "buyer",
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: user_1.default,
                    as: "seller",
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: product_1.default,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ["id", "comment", "rating"],
                            required: false,
                        },
                    ],
                },
            ],
        });
        if (!orderData) {
            throw new customErrors_1.default("Order not found", 404);
        }
        res.status(200).json({
            status: "success",
            order: orderData,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.getOrderById = getOrderById;
// Get buyer orders
const getBuyerOrders = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { buyerId } = req.params;
    const { orderStatus } = req.query;
    const whereClause = {
        buyerId,
    };
    if (orderStatus && orderStatus.trim() !== "") {
        whereClause.status = orderStatus;
    }
    try {
        const buyerOrders = yield order_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: "seller",
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: product_1.default,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ["id", "comment", "rating"],
                            required: false,
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            status: "success",
            ordersData: buyerOrders,
        });
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.getBuyerOrders = getBuyerOrders;
// Get seller orders
const getSellerOrders = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { sellerId } = req.params;
    const { orderStatus, productName } = req.query;
    const whereClause = {
        sellerId,
    };
    const prodWhereClause = {};
    if (orderStatus && orderStatus.trim() !== "") {
        whereClause.status = orderStatus;
    }
    if (productName && productName.trim() !== "") {
        prodWhereClause.productName = {
            [sequelize_1.Op.like]: `%${productName}%`,
        };
    }
    try {
        const sellerOrders = yield order_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: "buyer",
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: product_1.default,
                    where: prodWhereClause,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ["id", "comment", "rating"],
                            required: false,
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            status: "success",
            ordersData: sellerOrders,
        });
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.getSellerOrders = getSellerOrders;
// Create order
const createOrder = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield models_1.default.transaction();
    try {
        const { amount, shipAddress, weight, sellerId } = req.body;
        // Validate required fields
        if (!amount || !shipAddress || !weight || !sellerId) {
            throw new customErrors_1.default("Missing required fields", 400);
        }
        // Validate the sellerId Before Inserting
        const seller = yield user_1.default.findOne({ where: { id: sellerId } });
        if (!seller) {
            throw new customErrors_1.default("Invalid sellerId: Seller does not exist", 400);
        }
        const order = yield order_1.default.create({
            amount,
            shipAddress,
            weight,
            sellerId: seller.id,
            prodId: req.params.productId,
            buyerId: "3ff1ceec-9f0d-4952-9c6c-fe3973dd8fa1", // TODO: Replace with actual buyer ID from auth
            status: "pending",
            dispatched: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }, { transaction });
        yield transaction_1.default.create({
            amount: order.amount,
            orderId: order.id,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        }, { transaction });
        yield transaction.commit();
        res.status(200).json({
            message: "Order created successfully. Please proceed toward payment else order can not be processed further",
            orderDetails: order,
        });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.createOrder = createOrder;
// Update order
const updateOrder = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const txOrder = yield transaction_1.default.findOne({
            where: { orderId: req.params.orderId },
        });
        if (!txOrder) {
            throw new customErrors_1.default("Transaction not found for this order", 404);
        }
        if (txOrder.status !== "completed") {
            throw new customErrors_1.default("This Order is not in Transaction. Please make payment first", 403);
        }
        yield order_1.default.update({
            status: "processing",
            updatedAt: new Date()
        }, {
            where: { id: req.params.orderId },
        });
        const orderData = yield order_1.default.findByPk(req.params.orderId);
        if (!orderData) {
            throw new customErrors_1.default("Order not found", 404);
        }
        const [sellerData, buyerData] = yield Promise.all([
            user_1.default.findByPk(orderData.sellerId),
            user_1.default.findByPk(req.body.userId)
        ]);
        // Send notifications
        if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
            const notificationMessage = {
                title: "Order Completed",
                message: "Congratulations! Your Order has been marked as completed"
            };
            const pushMessage = {
                title: notificationMessage.title,
                text: notificationMessage.message
            };
            const result = yield (0, send_notification_1.default)(sellerData.expoPushToken, pushMessage);
            if (result && 'status' in result) {
                yield (0, handleExpoResponse_1.default)(result, orderData.sellerId, notificationMessage);
            }
        }
        if (buyerData === null || buyerData === void 0 ? void 0 : buyerData.expoPushToken) {
            const notificationMessage = {
                title: "Order Completion",
                message: "You have marked your order as completed"
            };
            const pushMessage = {
                title: notificationMessage.title,
                text: notificationMessage.message
            };
            const result = yield (0, send_notification_1.default)(buyerData.expoPushToken, pushMessage);
            if (result && 'status' in result) {
                yield (0, handleExpoResponse_1.default)(result, req.body.userId, notificationMessage);
            }
        }
        res.status(200).json({ message: "Order Completed Successfully!" });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.updateOrder = updateOrder;
// Get transaction
const getTransaction = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield transaction_1.default.findOne({
            where: { orderId: req.params.orderId },
        });
        if (!transaction) {
            throw new customErrors_1.default("Transaction not found", 404);
        }
        res.status(200).json({
            message: "Transaction Details",
            details: transaction,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
    }
});
exports.getTransaction = getTransaction;
// Update dispatch details
const updateDispatchDetails = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { method, date } = req.body;
        if (!method || !date) {
            throw new customErrors_1.default("Method and date are required", 400);
        }
        const details = {
            dispatchedAt: new Date(),
            method,
        };
        if (req.file) {
            const cloudinaryImageUpload = yield cloudinary_1.v2.uploader.upload(req.file.path, {
                resource_type: "image",
            });
            details.imageUrl = cloudinaryImageUpload.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const [updatedCount] = yield order_1.default.update({
            status: "dispatched",
            dispatched: true,
            dispatchDetails: details,
            deliveryDate: date,
            updatedAt: new Date()
        }, {
            where: { id: orderId },
        });
        if (updatedCount === 0) {
            throw new customErrors_1.default("Order not found", 404);
        }
        res.status(200).json({
            message: "Dispatch details updated successfully",
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.updateDispatchDetails = updateDispatchDetails;
