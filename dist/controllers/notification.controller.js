"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testExpoNotification = exports.markAsRead = exports.createNotification = exports.getNotification = void 0;
const tslib_1 = require("tslib");
const notifiation_1 = tslib_1.__importDefault(require("../models/notifiation"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
const getNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const allNotifications = yield notifiation_1.default.findAndCountAll({ where: { userId: userId },
            order: [['createdAt', 'DESC']],
            include: {
                model: user_1.default,
                attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser']
            }
        });
        res.status(200).json({
            notifiations: allNotifications
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotification = getNotification;
const createNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const { title, message } = req.body;
    try {
        const notification = yield notifiation_1.default.create({ userId, message, title, isRead: false });
        res.status(200).json({
            result: notification
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNotification = createNotification;
const markAsRead = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const notificcationId = req.params.id;
    try {
        yield notifiation_1.default.update({ isRead: true }, { where: { id: notificcationId } });
        res.status(200).json({
            message: "success"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.markAsRead = markAsRead;
const testExpoNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userID = req.params.userId;
    try {
        const userData = yield user_1.default.findOne({ where: { id: userID } });
        if (userData.expoPushToken) {
            const message = {
                to: userData.expoPushToken,
                sound: 'default',
                title: "Test Notification",
                body: "a test notification"
            };
            const response = yield fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
            const result = yield response.json(); // The response from Expo
            res.status(200).json({
                message: result
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.testExpoNotification = testExpoNotification;
