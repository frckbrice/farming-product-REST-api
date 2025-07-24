"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const sendPushNotificationToUser = (pushToken, messageToSend) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!pushToken)
        return; // No push token found for the user
    const message = {
        to: pushToken,
        sound: 'default',
        title: messageToSend.title,
        body: messageToSend.text,
    };
    try {
        const response = yield (0, node_fetch_1.default)('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        const result = yield response.json(); // The response from Expo
        return result;
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
});
exports.default = sendPushNotificationToUser;
