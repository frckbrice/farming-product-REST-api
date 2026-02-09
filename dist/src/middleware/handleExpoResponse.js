"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const notifiation_1 = tslib_1.__importDefault(require("../models/notifiation"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
const errors_1 = require("../errors");
/**
 * Handles the response from Expo's push notification service
 * @param result - The response from Expo's push notification service
 * @param userId - The ID of the user to receive the notification
 * @param messageToSend - The notification message details
 * @throws {AppError} When there's an error creating the notification
 */
const expoNotificationResponse = (result, userId, messageToSend) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (result.status === "ok") {
            const notificationData = {
                userId,
                title: messageToSend.title,
                message: messageToSend.message,
                isRead: false,
            };
            yield notifiation_1.default.create(notificationData);
            return;
        }
        if (result.status === "error" &&
            ((_a = result.details) === null || _a === void 0 ? void 0 : _a.error) === "DeviceNotRegistered") {
            // Remove the invalid push token from the user's record
            const updateResult = yield user_1.default.update({ expoPushToken: null }, { where: { id: userId } });
            // Check if the user was actually updated
            if (updateResult[0] === 0) {
                throw new errors_1.AppError(`User not found with ID: ${userId}`, 404);
            }
            return;
        }
        // Handle other error cases
        if (result.status === "error") {
            throw new errors_1.AppError(`Expo notification error: ${((_b = result.details) === null || _b === void 0 ? void 0 : _b.error) || "Unknown error"}`, 500);
        }
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        throw new errors_1.AppError("Failed to process Expo notification response", 500);
    }
});
exports.default = expoNotificationResponse;
