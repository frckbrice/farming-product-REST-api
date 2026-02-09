"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const errors_1 = require("../errors");
/**
 * Sends a push notification to a user via Expo's push notification service
 * @param pushToken - The user's Expo push token
 * @param messageToSend - The notification message details
 * @returns The response from Expo's push notification service
 * @throws {AppError} When the notification fails to send
 */
const sendPushNotificationToUser = (pushToken, messageToSend) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!pushToken) {
        return undefined;
    }
    const message = {
        to: pushToken,
        sound: "default",
        title: messageToSend.title,
        body: messageToSend.text,
        priority: "high",
    };
    try {
        const response = yield (0, node_fetch_1.default)("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        if (!response.ok) {
            throw new errors_1.AppError(`Failed to send notification: ${response.statusText}`, response.status);
        }
        const result = (yield response.json());
        // Check for errors in the response
        const error = (_a = result.data) === null || _a === void 0 ? void 0 : _a.find((item) => item.status === "error");
        if (error) {
            throw new errors_1.AppError(`Expo notification error: ${error.message}`, 500);
        }
        return result;
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new errors_1.AppError(`Failed to send push notification: ${error.message}`, 500);
        }
        throw new errors_1.AppError("Failed to send push notification", 500);
    }
});
exports.default = sendPushNotificationToUser;
