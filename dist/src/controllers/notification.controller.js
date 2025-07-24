"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testExpoNotification = exports.markAsRead = exports.createNotification = exports.getNotification = void 0;
const tslib_1 = require("tslib");
const notifiation_1 = tslib_1.__importDefault(require("../models/notifiation"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Get all notifications for a user
const getNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const allNotifications = yield notifiation_1.default.findAndCountAll({
            where: { userId },
            order: [["createdAt", "DESC"]],
            include: {
                model: user_1.default,
                attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
            },
        });
        res.status(200).json({
            notifications: allNotifications,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getNotification = getNotification;
// Create a new notification
const createNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { title, message } = req.body;
    try {
        if (!title || !message) {
            throw new customErrors_1.default("Title and message are required", 400);
        }
        const notification = yield notifiation_1.default.create({
            userId,
            message,
            title,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        if (!notification) {
            throw new customErrors_1.default("Failed to create notification", 500);
        }
        res.status(200).json({
            result: notification,
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
exports.createNotification = createNotification;
// Mark a notification as read
const markAsRead = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: notificationId } = req.params;
    try {
        const [updatedCount] = yield notifiation_1.default.update({ isRead: true, updatedAt: new Date() }, { where: { id: notificationId } });
        if (updatedCount === 0) {
            throw new customErrors_1.default("Notification not found", 404);
        }
        res.status(200).json({
            message: "Notification marked as read",
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
exports.markAsRead = markAsRead;
// Test Expo notification
const testExpoNotification = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    try {
        const userData = yield user_1.default.findOne({ where: { id: userId } });
        if (!userData) {
            throw new customErrors_1.default("User not found", 404);
        }
        if (!userData.expoPushToken) {
            throw new customErrors_1.default("User has no push token registered", 400);
        }
        const message = {
            to: userData.expoPushToken,
            sound: "default",
            title: "Test Notification",
            body: "A test notification",
            priority: "high",
        };
        const response = yield fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        if (!response.ok) {
            throw new customErrors_1.default(`Failed to send notification: ${response.statusText}`, response.status);
        }
        const result = (yield response.json());
        // Check for errors in the response
        const error = (_a = result.data) === null || _a === void 0 ? void 0 : _a.find(item => item.status === "error");
        if (error) {
            throw new customErrors_1.default(`Expo notification error: ${error.message}`, 500);
        }
        res.status(200).json({
            message: "Notification sent successfully",
            result,
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
exports.testExpoNotification = testExpoNotification;
