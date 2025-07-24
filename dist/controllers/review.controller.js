"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOwnReview = exports.updateReview = exports.createReview = exports.getReviewByProdId = exports.orderReview = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const order_1 = tslib_1.__importDefault(require("../models/order"));
const sequelize_1 = require("sequelize");
const send_notification_1 = tslib_1.__importDefault(require("../middleware/send-notification"));
const handleExpoResponse_1 = tslib_1.__importDefault(require("../middleware/handleExpoResponse"));
// get review of a product
const orderReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let orderReview = yield buyerreview_1.default.findOne({ where: { orderId: req.params.orderId },
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: product_1.default,
                    attributes: ['id', 'productName', 'productCat', 'imageUrl']
                }
            ]
        });
        res.status(200).json({
            status: "success",
            orderReviewData: orderReview
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});
exports.orderReview = orderReview;
// get reviews of a product
const getReviewByProdId = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let whereClause = {
        prodId: req.params.productId
    };
    let rating = req.query.rating;
    if (rating && rating.trim() !== '') {
        // convert rating from string to number
        let ratingNum = Number(rating);
        whereClause.rating = {
            [sequelize_1.Op.eq]: ratingNum
        };
    }
    try {
        // let productId= req.params.productId
        //get the reviews by product id
        const revs = yield buyerreview_1.default.findAndCountAll({ where: whereClause,
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                },
                {
                    model: product_1.default,
                    attributes: ['id', 'productName', 'productCat', 'imageUrl']
                }
            ]
        });
        res.status(200).json({ reviews: revs });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getReviewByProdId = getReviewByProdId;
// create a review
const createReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let reviewData = req.body;
    const reviewOrder = {
        rating: req.body.rating,
        comment: req.body.comment
    };
    try {
        reviewData.prodId = req.params.productId;
        reviewData.userId = req.userData.UserId;
        reviewData.orderId = req.params.orderId;
        reviewData.rating = req.body.rating;
        reviewData.comment = req.body.comment;
        let order = yield order_1.default.findOne({ where: { id: req.params.orderId } });
        if ((order === null || order === void 0 ? void 0 : order.status) === 'delivered') {
            yield buyerreview_1.default.create(reviewData);
            yield order_1.default.update({
                review: reviewOrder
            }, { where: { id: req.params.orderId } });
            const sellerData = yield user_1.default.findByPk(order.sellerId);
            // sending notification
            if (sellerData === null || sellerData === void 0 ? void 0 : sellerData.expoPushToken) {
                const messageToSend = {
                    title: 'Order Reviewed',
                    message: `You got a review on your order from the buyer`
                };
                // Notify the seller about the new order
                const result = yield (0, send_notification_1.default)(sellerData.expoPushToken, messageToSend);
                yield (0, handleExpoResponse_1.default)(result, order.sellerId, messageToSend);
            }
            res.status(200).json({ message: "Review Added Successfully!" });
        }
        else {
            res.status(401).json({
                message: "The order is still in processing or pending state. You can not review yet"
            });
        }
    }
    catch (err) {
        res.status(500).json({ "error": err.message });
    }
});
exports.createReview = createReview;
// update a review
const updateReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let reviewUpdates = req.body;
    let reviewId = req.params.reviewId;
    try {
        yield buyerreview_1.default.update(reviewUpdates, { where: { id: reviewId } });
        res.status(200).json({ message: "review successfully updated!" });
    }
    catch (err) {
        res.send(500).json({ "error": err.message });
    }
});
exports.updateReview = updateReview;
// remove a review of a user who  is logged in and  owns the review
const deleteOwnReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let reviewId = req.params.reviewId;
    try {
        const review = yield buyerreview_1.default.findAll({ where: { id: reviewId },
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
                }
            ] });
        if ((review === null || review === void 0 ? void 0 : review.userId) === req.userData.UserId) {
            yield buyerreview_1.default.destroy({ where: { id: reviewId } });
            return res.status(204).json({ message: "Review Deleted!" });
        }
        else {
            res.status(404).json({ message: "You are not owner of that review. You can not do that operation!" });
        }
    }
    catch (err) {
        res.send(500).json({ "error": err.message });
    }
});
exports.deleteOwnReview = deleteOwnReview;
module.exports = {
    getReviewByProdId: exports.getReviewByProdId,
    createReview: exports.createReview,
    updateReview: exports.updateReview,
    deleteOwnReview: exports.deleteOwnReview,
    orderReview: exports.orderReview
};
