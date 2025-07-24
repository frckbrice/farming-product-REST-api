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
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const getOrderById = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let orderData = yield order_1.default.findOne({
            where: { id: req.params.orderId },
            include: [
                {
                    model: user_1.default,
                    as: 'buyer',
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: user_1.default,
                    as: 'seller',
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: product_1.default,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ['id', 'comment', 'rating'],
                            required: false
                        }
                    ]
                }
            ]
        });
        res.status(200).json({
            status: "success",
            order: orderData
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getOrderById = getOrderById;
const getBuyerOrders = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const buyerID = req.params.buyerId;
    const statusQuery = (_a = req.query) === null || _a === void 0 ? void 0 : _a.orderStatus;
    let whereClause = {
        buyerId: buyerID
    };
    if (statusQuery && statusQuery.trim() !== '') {
        whereClause.status = statusQuery;
    }
    try {
        let buyerOrders = yield order_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: 'seller',
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: product_1.default,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ['id', 'comment', 'rating'],
                            required: false
                        }
                    ]
                }
            ]
        });
        res.status(200).json({
            status: "success",
            ordersData: buyerOrders
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getBuyerOrders = getBuyerOrders;
const getSellerOrders = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let whereClause = {
        sellerId: req.params.sellerId
    };
    let prodWhereClause = {};
    const statusQuery = (_a = req.query) === null || _a === void 0 ? void 0 : _a.orderStatus;
    const searchProductName = (_b = req.query) === null || _b === void 0 ? void 0 : _b.productName;
    if (statusQuery && statusQuery.trim() !== '') {
        whereClause.status = statusQuery;
    }
    if (searchProductName && searchProductName.trim() !== '') {
        prodWhereClause.productName = {
            [sequelize_1.Op.like]: `%${searchProductName}%`
        };
    }
    try {
        let sellerOrders = yield order_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: 'buyer',
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: product_1.default,
                    where: prodWhereClause,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                        },
                        {
                            model: buyerreview_1.default,
                            attributes: ['id', 'comment', 'rating'],
                            required: false
                        }
                    ]
                }
            ]
        });
        res.status(200).json({
            status: "success",
            ordersData: sellerOrders
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getSellerOrders = getSellerOrders;
const createOrder = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        var transaction = yield models_1.default.transaction();
        let { amount, shipAddress, weight, sellerId } = req.body;
        console.log("\n\n req.body", req.body);
        // Validate the sellerId Before Inserting
        const seller = yield user_1.default.findOne({ where: { id: sellerId } });
        if (!seller) {
            return res.status(400).json({ message: 'Invalid sellerId: Seller does not exist.' });
        }
        // orderData.buyerId = req.userData.UserId;
        let order = yield order_1.default.create({
            amount,
            shipAddress, // string
            weight,
            sellerId: (_a = seller === null || seller === void 0 ? void 0 : seller.id) !== null && _a !== void 0 ? _a : sellerId,
            prodId: req.params.productId,
            // buyerId: req.userData.UserId,
            buyerId: "3ff1ceec-9f0d-4952-9c6c-fe3973dd8fa1",
            status: 'pending',
            dispatched: false
        }, { transaction });
        let chargeTransaction = yield transaction_1.default.create({
            amount: order.amount,
            orderId: order.id,
            status: 'pending'
        }, { transaction });
        // commiting the DB transaction
        yield transaction.commit();
        // await models.Transaction.create({orderId: order.id})
        res.status(200).json({
            message: 'Order created successfully. Please proceed toward payment else order can not be processed further',
            orderDetails: order
        });
    }
    catch (err) {
        console.error("\n\n err: ", err);
        yield transaction.rollback();
        res.status(500).json({ message: err.message });
    }
});
exports.createOrder = createOrder;
const updateOrder = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let txOrder = yield transaction_1.default.findOne({
            where: { orderId: req.params.orderId }
        });
        if (txOrder && txOrder.status !== 'completed') {
            return res.status(403).json({
                message: "This Order is not in Transaction. Please make payment first"
            });
        }
        if ((txOrder === null || txOrder === void 0 ? void 0 : txOrder.status) === 'completed') {
            yield order_1.default.update({ status: 'processing' }, {
                where: { id: req.params.orderId },
            });
            let orderData = yield order_1.default.findByPk(req.params.orderId);
            let sellerId = orderData === null || orderData === void 0 ? void 0 : orderData.sellerId;
            const sellerData = yield user_1.default.findByPk(sellerId);
            const buyerData = yield user_1.default.findByPk(req.userData.UserId);
            if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
                const messageToSend = {
                    title: 'Order Completed',
                    message: `Congratulations! Your Order has been marked as completed`
                };
                // Notify the seller about the new order
                const result = yield (0, send_notification_1.default)(sellerData.expoPushToken, messageToSend);
                yield (0, handleExpoResponse_1.default)(result, sellerId, messageToSend);
            }
            if (buyerData === null || buyerData === void 0 ? void 0 : buyerData.expoPushToken) {
                const messageToSend = {
                    title: 'Order Completion',
                    message: `You have marked your order as completed`
                };
                // Notify the buyer about the new order
                const result = yield (0, send_notification_1.default)(buyerData.expoPushToken, messageToSend);
                yield (0, handleExpoResponse_1.default)(result, req.userData.UserId, messageToSend);
            }
            res.status(200).json({ message: "Order Completed Successfully!" });
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.updateOrder = updateOrder;
const getTransaction = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let orderID = req.params.orderId;
    try {
        let transaction = yield transaction_1.default.findOne({ where: { orderId: orderID } });
        return res.status(200).json({
            message: "Transaction Details",
            details: transaction
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});
exports.getTransaction = getTransaction;
const updateDispatchDetails = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.orderId;
    let dispatchData = req.body;
    let details = {
        dispatchedAt: Date.now(),
        method: dispatchData.method
    };
    try {
        var cloudinary_image_uplaod;
        if (req.file) {
            // upload image to the cloudinary
            cloudinary_image_uplaod = yield cloudinary_1.v2.uploader.upload(req.file.path, {
                resource_type: 'image'
            });
            // saving the imagine url of the cloudinary to our db
            details.imageUrl = cloudinary_image_uplaod.secure_url;
            // removing the file from public directory
            fs.unlinkSync(req.file.path);
        }
        const result = yield order_1.default.update({
            status: 'dispatched',
            dispatched: true,
            dispatchDetails: JSON.stringify(details),
            deliveryDate: dispatchData.date
        }, {
            where: { id: orderId }
        });
        res.status(200).json({
            message: "Dispatch details updated successfully"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateDispatchDetails = updateDispatchDetails;
