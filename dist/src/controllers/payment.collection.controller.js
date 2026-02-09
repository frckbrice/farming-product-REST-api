"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmExternalPayment = exports.collectionResponseAdwa = exports.mobilePaymentCollection = void 0;
const tslib_1 = require("tslib");
const models_1 = tslib_1.__importDefault(require("../models"));
const errors_1 = require("../errors");
const providers_1 = require("../payment/providers");
const paymentService = tslib_1.__importStar(require("../services/payment.collection.service"));
// Mobile payment collection (provider-agnostic: uses configured provider, default ADWA)
const mobilePaymentCollection = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderId } = req.params;
    const paymentData = req.body;
    const transaction = yield models_1.default.transaction();
    try {
        yield paymentService.getOrderForPayment(orderId);
        const provider = (0, providers_1.getPaymentProvider)(req.query.provider || undefined);
        const payload = {
            meanCode: paymentData.meanCode,
            amount: typeof paymentData.amount === "number"
                ? String(paymentData.amount)
                : paymentData.amount,
            currency: paymentData.currency,
            orderNumber: `order_${orderId}_${Date.now()}`,
            paymentNumber: paymentData.paymentNumber,
            feesAmount: paymentData.feesAmount,
        };
        const paymentRequest = yield provider.initiatePayment(payload, orderId);
        if (paymentRequest.redirectUrl) {
            res.json({
                message: Object.assign(Object.assign({}, paymentRequest.raw), { CARD_PAY_LINK: paymentRequest.redirectUrl, adpFootprint: paymentRequest.footprint, orderNumber: payload.orderNumber, status: paymentRequest.status }),
            });
            return;
        }
        if (!((_a = provider.requiresPollingAfterInitiate) === null || _a === void 0 ? void 0 : _a.call(provider, paymentData.meanCode))) {
            res.json({ message: paymentRequest.raw });
            return;
        }
        const footprint = paymentRequest.footprint;
        if (!footprint) {
            res.status(400).json({
                message: "Payment initiation did not return a footprint for status check",
            });
            return;
        }
        setTimeout(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            try {
                const resOutput = yield provider.checkStatus(footprint, paymentData.meanCode);
                if (resOutput.success) {
                    yield paymentService.completeTransactionAfterPoll(orderId, {
                        amount: payload.amount,
                        meanCode: paymentData.meanCode,
                        currency: paymentData.currency,
                    }, (_a = resOutput.raw) !== null && _a !== void 0 ? _a : resOutput, transaction);
                    yield transaction.commit();
                    res.status(200).json({
                        status: "success",
                        message: (_b = resOutput.raw) !== null && _b !== void 0 ? _b : resOutput,
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
                if (error instanceof errors_1.AppError) {
                    res.status(error.statusCode).json({ message: error.message });
                }
                else {
                    res.status(500).json({
                        message: error instanceof Error
                            ? error.message
                            : "An error occurred during payment processing",
                    });
                }
            }
        }), 100000);
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "An error occurred during payment processing",
            });
        }
    }
});
exports.mobilePaymentCollection = mobilePaymentCollection;
const collectionResponseAdwa = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const provider = (0, providers_1.getPaymentProvider)("adwa");
        const checkResponse = yield provider.checkStatus(req.body.footPrint, req.body.moyenPaiement);
        const result = yield paymentService.processAdwaWebhook(req.body, checkResponse);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "An error occurred during payment processing",
            });
        }
    }
});
exports.collectionResponseAdwa = collectionResponseAdwa;
const confirmExternalPayment = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield paymentService.confirmExternalPayment(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "An error occurred during payment processing",
            });
        }
    }
});
exports.confirmExternalPayment = confirmExternalPayment;
