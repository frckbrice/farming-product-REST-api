"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const notifiation_1 = tslib_1.__importDefault(require("../models/notifiation")); // Adjust imports based on your project structure
const user_1 = tslib_1.__importDefault(require("../models/user"));
const expoNotificationResponse = (result, userId, messageToSend) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (result.status === 'ok') {
        yield notifiation_1.default.create({
            userId: userId,
            title: messageToSend.title,
            message: messageToSend.message,
            isRead: false
        });
        return;
    }
    if (result.status === 'error') {
        if (result.details && result.details.error === 'DeviceNotRegistered') {
            // This means the push token is invalid (e.g., app was uninstalled)
            // Remove or invalidate the push token from your database
            yield user_1.default.update({ expoPushToken: null }, { where: { id: userId } });
            return;
        }
        else {
            return;
        }
    }
});
exports.default = expoNotificationResponse;
