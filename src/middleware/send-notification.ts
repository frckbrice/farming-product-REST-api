import fetch, { Response } from "node-fetch";
import AppError from "../errors/customErrors";

interface MessageToSend {
  title: string;
  text: string;
}

interface ExpoMessage {
  to: string;
  sound: "default" | "custom";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: "default" | "normal" | "high";
}

interface ExpoResponse {
  data: {
    status: "ok" | "error";
    id: string;
    message: string;
  }[];
}

/**
 * Sends a push notification to a user via Expo's push notification service
 * @param pushToken - The user's Expo push token
 * @param messageToSend - The notification message details
 * @returns The response from Expo's push notification service
 * @throws {AppError} When the notification fails to send
 */
const sendPushNotificationToUser = async (
  pushToken: string | null,
  messageToSend: MessageToSend,
): Promise<ExpoResponse | undefined> => {
  if (!pushToken) {
    return undefined;
  }

  const message: ExpoMessage = {
    to: pushToken,
    sound: "default",
    title: messageToSend.title,
    body: messageToSend.text,
    priority: "high",
  };

  try {
    const response: Response = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      },
    );

    if (!response.ok) {
      throw new AppError(
        `Failed to send notification: ${response.statusText}`,
        response.status,
      );
    }

    const result = (await response.json()) as ExpoResponse;

    // Check for errors in the response
    const error = result.data?.find((item) => item.status === "error");
    if (error) {
      throw new AppError(`Expo notification error: ${error.message}`, 500);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError(
        `Failed to send push notification: ${error.message}`,
        500,
      );
    }
    throw new AppError("Failed to send push notification", 500);
  }
};

export default sendPushNotificationToUser;
