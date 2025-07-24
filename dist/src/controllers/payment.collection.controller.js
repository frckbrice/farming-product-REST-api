"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionResponseAdwa = exports.mobilePaymentCollection = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const order_1 = tslib_1.__importDefault(require("../models/order"));
const transaction_1 = tslib_1.__importDefault(require("../models/transaction"));
const axios_1 = tslib_1.__importStar(require("axios"));
const models_1 = tslib_1.__importDefault(require("../models"));
const send_notification_1 = tslib_1.__importDefault(require("../middleware/send-notification"));
const handleExpoResponse_1 = tslib_1.__importDefault(require("../middleware/handleExpoResponse"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Payment gateway adwapay configuration
const MERCHANT_KEY = process.env.ADWA_MERCHANT_KEY;
const APPLICATION_KEY = process.env.ADWA_APPLICATION_KEY;
const SUBSCRIPTION_KEY = process.env.ADWA_SUBSCRIPTION_KEY;
const BaseURL_Adwa = process.env.ADWA_BASE_URL;
if (!MERCHANT_KEY || !APPLICATION_KEY || !SUBSCRIPTION_KEY || !BaseURL_Adwa) {
    throw new Error("Missing required Adwa payment configuration");
}
// Get authentication token
const getAuthToken = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = JSON.stringify({
            application: APPLICATION_KEY,
        });
        const config = {
            method: "post",
            url: `${BaseURL_Adwa}/getADPToken`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(MERCHANT_KEY + ":" + SUBSCRIPTION_KEY).toString("base64")}`,
            },
            data,
        };
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError && error.response) {
            throw new customErrors_1.default(`Failed to get auth token: ${error.response.data.message || error.message}`, error.response.status);
        }
        throw new customErrors_1.default("Failed to get auth token", 500);
    }
});
// Payment initiation
const paymentCollectRequest = (data, token) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = {
            method: "post",
            url: `${BaseURL_Adwa}/requestToPay`,
            headers: {
                "AUTH-API-TOKEN": `Bearer ${token}`,
                "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY,
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
        };
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError && error.response) {
            throw new customErrors_1.default(`Payment request failed: ${error.response.data.message || error.message}`, error.response.status);
        }
        throw new customErrors_1.default("Payment request failed", 500);
    }
});
// Check payment status
const chargeStatusCheck = (footPrint, meanCode, token) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = JSON.stringify({
            adpFootprint: footPrint,
            meanCode,
        });
        const config = {
            method: "post",
            url: `${BaseURL_Adwa}/paymentStatus`,
            headers: {
                "AUTH-API-TOKEN": `Bearer ${token}`,
                "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY,
                "Content-Type": "application/json",
            },
            data,
        };
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError && error.response) {
            throw new customErrors_1.default(`Failed to check payment status: ${error.response.data.message || error.message}`, error.response.status);
        }
        throw new customErrors_1.default("Failed to check payment status", 500);
    }
});
// Mobile payment collection
const mobilePaymentCollection = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const paymentData = req.body;
    const transaction = yield models_1.default.transaction();
    try {
        const order = yield order_1.default.findByPk(orderId);
        if (!order) {
            throw new customErrors_1.default("Order not found or not created", 404);
        }
        const userToken = yield getAuthToken();
        if (!userToken.data.tokenCode) {
            throw new customErrors_1.default("Unable to get the token from the payment service providers. Please try again", 403);
        }
        // Requesting payment initiation
        paymentData.orderNumber = `order_${orderId}_${Date.now()}`;
        const paymentRequest = yield paymentCollectRequest(paymentData, userToken.data.tokenCode);
        if (paymentData.meanCode === "MASTERCARD" || paymentData.meanCode === "VISA") {
            res.json({ message: paymentRequest.data });
            return;
        }
        setTimeout(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            try {
                const resOutput = yield chargeStatusCheck(paymentRequest.data.adpFootprint, paymentData.meanCode, userToken.data.tokenCode);
                if (resOutput.data.status === "T") {
                    yield transaction_1.default.update({
                        amount: parseFloat(paymentData.amount),
                        status: "completed",
                        txMethod: paymentData.meanCode,
                        currency: paymentData.currency,
                        orderId,
                        txDetails: resOutput.data,
                        updatedAt: new Date()
                    }, { where: { orderId }, transaction });
                    yield transaction.commit();
                    res.status(200).json({
                        status: "success",
                        message: resOutput.data,
                    });
                }
                else {
                    yield transaction.rollback();
                    res.status(400).json({
                        response: resOutput,
                        message: "Payment was not successfully processed from the end-user.",
                    });
                }
            }
            catch (error) {
                yield transaction.rollback();
                if (error instanceof customErrors_1.default) {
                    res.status(error.statusCode).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred during payment processing" });
                }
            }
        }), 100000);
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred during payment processing" });
        }
    }
});
exports.mobilePaymentCollection = mobilePaymentCollection;
// Collection webhook response
const collectionResponseAdwa = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { status, footPrint, orderNumber, moyenPaiement, amount } = req.body;
    const transaction = yield models_1.default.transaction();
    try {
        if (status !== "T") {
            throw new customErrors_1.default("Payment validation failed", 400);
        }
        const authToken = yield getAuthToken();
        if (!authToken.data.tokenCode) {
            throw new customErrors_1.default("Failed to get authentication token", 500);
        }
        const checkResponse = yield chargeStatusCheck(footPrint, moyenPaiement, authToken.data.tokenCode);
        if (checkResponse.data.status !== "T") {
            throw new customErrors_1.default("Payment validation failed", 400);
        }
        const order = yield order_1.default.findByPk(orderNumber);
        if (!order) {
            throw new customErrors_1.default("Order not found", 404);
        }
        const [sellerData, buyerData] = yield Promise.all([
            user_1.default.findByPk(order.sellerId),
            user_1.default.findByPk(order.buyerId)
        ]);
        yield Promise.all([
            transaction_1.default.update({
                amount,
                status: "completed",
                txMethod: moyenPaiement,
                txDetails: checkResponse.data,
                updatedAt: new Date()
            }, { where: { orderId: order.id }, transaction }),
            order_1.default.update({
                status: "processing",
                updatedAt: new Date()
            }, { where: { id: order.id }, transaction })
        ]);
        // Send notifications
        if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
            const notificationMessage = {
                title: "New Order",
                message: "Congratulations! You have received a New Order.",
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
        if (buyerData === null || buyerData === void 0 ? void 0 : buyerData.expoPushToken) {
            const notificationMessage = {
                title: "Payment Done",
                message: "Your Payment has been Successfully Made and Your order has started",
            };
            const pushMessage = {
                title: notificationMessage.title,
                text: notificationMessage.message
            };
            const result = yield (0, send_notification_1.default)(buyerData.expoPushToken, pushMessage);
            if (result && 'status' in result) {
                yield (0, handleExpoResponse_1.default)(result, order.buyerId, notificationMessage);
            }
        }
        yield transaction.commit();
        res.status(200).json({ message: "Payment processed successfully" });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred during payment processing" });
        }
    }
});
exports.collectionResponseAdwa = collectionResponseAdwa;
