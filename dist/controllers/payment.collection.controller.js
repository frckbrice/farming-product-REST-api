"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionResponseAdwa = exports.mobilePaymentCollection = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const order_1 = tslib_1.__importDefault(require("../models/order"));
const transaction_1 = tslib_1.__importDefault(require("../models/transaction"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const models_1 = tslib_1.__importDefault(require("../models"));
const send_notification_1 = tslib_1.__importDefault(require("../middleware/send-notification"));
const handleExpoResponse_1 = tslib_1.__importDefault(require("../middleware/handleExpoResponse"));
// payment gateway adwapay
const MERCHANT_KEY = process.env.ADWA_MERCHANT_KEY;
const APPLICATION_KEY = process.env.ADWA_APPLICATION_KEY;
const SUBSCRIPTION_KEY = process.env.ADWA_SUBSCRIPTION_KEY;
const BaseURL_Adwa = process.env.ADWA_BASE_URL;
// 1-getitng auth token
const getAuthToken = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = JSON.stringify({
            "application": APPLICATION_KEY
        });
        let config = {
            method: 'post',
            url: `${BaseURL_Adwa}/getADPToken`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(MERCHANT_KEY + ':' + SUBSCRIPTION_KEY).toString('base64')}`,
            },
            data: data
        };
        let response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (err) {
        console.log(err);
    }
});
// 2- Payment initiation
const paymentCollectRequest = (data, token) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let config = {
            method: 'post',
            url: `${BaseURL_Adwa}/requestToPay`,
            headers: {
                'AUTH-API-TOKEN': `Bearer ${token}`,
                'AUTH-API-SUBSCRIPTION': SUBSCRIPTION_KEY,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data)
        };
        let response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (err) {
        console.log(err.message);
    }
});
const mobilePaymentCollection = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var paymentData = req.body;
    // console.log("payment data is: ", paymentData)
    let orderId = req.params.orderId;
    const transaction = yield models_1.default.transaction();
    try {
        const order = yield order_1.default.findByPk(orderId);
        if (!order)
            return res.status(404).json({ error: 'Order not found or not created' });
        let userToken = yield getAuthToken();
        if (userToken.data.tokenCode) {
            // requesting a payment initiation
            paymentData.orderNumber = `order_${orderId}_${Date.now()}`;
            let paymentRequest = yield paymentCollectRequest(paymentData, userToken.data.tokenCode);
            if (paymentData.meanCode === 'MASTERCARD' || paymentData.meanCode === 'VISA') {
                return res.json({ message: paymentRequest.data });
            }
            // var paymentStatus = {}
            setTimeout(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                let resOutput = yield chargeStatusCheck(paymentRequest.data.adpFootprint, paymentData.meanCode, userToken.data.tokenCode);
                // paymentStatus = resOutput.data
                if (resOutput.data.status === 'T') {
                    yield transaction_1.default.update({
                        amount: parseFloat(paymentData.amount),
                        status: 'completed',
                        txMethod: paymentData.meanCode,
                        currency: paymentData.currency,
                        orderId: orderId,
                        txDetails: resOutput.data
                    }, { where: { orderId: orderId }, transaction });
                    yield transaction.commit();
                    return res.status(200).json({
                        status: "success",
                        message: resOutput.data
                    });
                }
                else {
                    return res.json({ response: resOutput,
                        message: "Payment was not successfully processed from the end-user."
                    });
                }
            }), 100000);
        }
        else {
            return res.status(403).json({
                message: "unable to get the token from the payment service providers. Please try again"
            });
        }
    }
    catch (err) {
        yield transaction.rollback();
        res.status(500).json({
            message: err.message
        });
    }
});
exports.mobilePaymentCollection = mobilePaymentCollection;
// webhook for adwapay
// manual status check
const chargeStatusCheck = (footPrint, meanCode, token) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let data = JSON.stringify({
        "adpFootprint": footPrint,
        "meanCode": meanCode
    });
    let config = {
        method: 'post',
        url: `${BaseURL_Adwa}/paymentStatus`,
        headers: {
            'AUTH-API-TOKEN': `Bearer ${token}`,
            'AUTH-API-SUBSCRIPTION': SUBSCRIPTION_KEY,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        let response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (err) {
        console.log("error is status check ", err.message);
    }
});
const collectionResponseAdwa = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    // console.log("from the adwapay",req.body)
    // res.status(200).json({message: "OK"})
    // let io = req.app.get('socketio');  // Access the io instance
    // console.log("io instance is: ", io)
    const { status, footPrint, orderNumber, moyenPaiement, amount } = req.body;
    const transaction = yield models_1.default.transaction();
    try {
        if (status === 'T') {
            // const orderCode = orderNumber.split('-')
            // recheck the payment status
            // 1-get auth token
            let authToken = yield getAuthToken();
            if (authToken.data.tokenCode) {
                let checkResponse = yield chargeStatusCheck(footPrint, moyenPaiement, authToken.data.tokenCode);
                // console.log("check response", checkResponse.data)
                if (checkResponse.data.status === 'T') {
                    let order = yield order_1.default.findByPk(orderNumber);
                    const sellerData = yield user_1.default.findByPk(order.sellerId);
                    const buyerData = yield user_1.default.findByPk(order.buyerId);
                    // console.log("order is: ", order)
                    yield transaction_1.default.update({
                        amount: amount,
                        status: 'completed',
                        txMethod: moyenPaiement,
                        txDetails: checkResponse.data
                    }, { where: { orderId: order.id }, transaction });
                    yield order_1.default.update({
                        status: 'processing'
                    }, {
                        where: { id: order.id },
                        transaction
                    });
                    // sending notification
                    if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
                        const messageToSend = {
                            title: 'New Order',
                            message: `Congratulations! You have received a New Order.`
                        };
                        // Notify the seller about the new order
                        const result = yield (0, send_notification_1.default)(sellerData.expoPushToken, messageToSend);
                        yield (0, handleExpoResponse_1.default)(result, order.sellerId, messageToSend);
                    }
                    if (buyerData === null || buyerData === void 0 ? void 0 : buyerData.expoPushToken) {
                        const messageToSend = {
                            title: 'Payment Done',
                            message: `Your Payment has been Succesfully Made and Your order has started`
                        };
                        // Notify the buyer about the new order
                        const result = yield (0, send_notification_1.default)(buyerData.expoPushToken, messageToSend);
                        yield (0, handleExpoResponse_1.default)(result, order.buyerId, messageToSend);
                    }
                }
                yield transaction.commit();
                // Emit the event to notify the frontend of the order status
                // await io.emit('orderStatus', { ok: true });
                return res.status(200);
            }
        }
    }
    catch (err) {
        yield transaction.rollback();
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.collectionResponseAdwa = collectionResponseAdwa;
