import Notification from "../models/notifiation";
import User from "../models/user";
import { AppError } from "../errors";

export interface ExpoResponse {
  status: "ok" | "error";
  details?: {
    error?:
      | "DeviceNotRegistered"
      | "MessageTooBig"
      | "InvalidCredentials"
      | string;
  };
}

interface MessageToSend {
  title: string;
  message: string;
}

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
}

/**
 * Handles the response from Expo's push notification service
 * @param result - The response from Expo's push notification service
 * @param userId - The ID of the user to receive the notification
 * @param messageToSend - The notification message details
 * @throws {AppError} When there's an error creating the notification
 */
const expoNotificationResponse = async (
  result: ExpoResponse,
  userId: string,
  messageToSend: MessageToSend,
): Promise<void> => {
  try {
    if (result.status === "ok") {
      const notificationData: NotificationData = {
        userId,
        title: messageToSend.title,
        message: messageToSend.message,
        isRead: false,
      };

      await Notification.create(notificationData);
      return;
    }

    if (
      result.status === "error" &&
      result.details?.error === "DeviceNotRegistered"
    ) {
      // Remove the invalid push token from the user's record
      const updateResult = await User.update(
        { expoPushToken: null },
        { where: { id: userId } },
      );

      // Check if the user was actually updated
      if (updateResult[0] === 0) {
        throw new AppError(`User not found with ID: ${userId}`, 404);
      }
      return;
    }

    // Handle other error cases
    if (result.status === "error") {
      throw new AppError(
        `Expo notification error: ${result.details?.error || "Unknown error"}`,
        500,
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process Expo notification response", 500);
  }
};

export default expoNotificationResponse;
