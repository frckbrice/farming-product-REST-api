"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testExpoNotification = exports.markAsRead = exports.createNotification = exports.getNotification = void 0;
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const notificationService = tslib_1.__importStar(require("../services/notification.service"));
const getNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const allNotifications = yield notificationService.getNotificationsByUserId(req.params.userId);
        res.status(200).json({ notifications: allNotifications });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotification = getNotification;
const createNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notificationService.createNotification(req.params.userId, req.body);
        res.status(200).json({ result: notification });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.createNotification = createNotification;
const markAsRead = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield notificationService.markNotificationAsRead(req.params.id);
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
exports.markAsRead = markAsRead;
const testExpoNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield notificationService.sendTestExpoNotification(req.params.userId);
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
exports.testExpoNotification = testExpoNotification;
