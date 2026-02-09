import Notification from "../models/notifiation";
import User from "../models/user";
import { AppError } from "../errors";

export interface CreateNotificationInput {
  title: string;
  message: string;
}

export async function getNotificationsByUserId(userId: string) {
  return await Notification.findAndCountAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: {
      model: User,
      attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
    },
  });
}

export async function createNotification(
  userId: string,
  data: CreateNotificationInput,
) {
  const { title, message } = data;

  if (!title || !message) {
    throw new AppError("Title and message are required", 400);
  }

  const notification = await Notification.create({
    userId,
    message,
    title,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!notification) {
    throw new AppError("Failed to create notification", 500);
  }

  return notification;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ message: string }> {
  const [updatedCount] = await Notification.update(
    { isRead: true, updatedAt: new Date() },
    { where: { id: notificationId } },
  );

  if (updatedCount === 0) {
    throw new AppError("Notification not found", 404);
  }

  return { message: "Notification marked as read" };
}

export async function sendTestExpoNotification(userId: string) {
  const userData = await User.findOne({ where: { id: userId } });
  if (!userData) {
    throw new AppError("User not found", 404);
  }

  if (!userData.expoPushToken) {
    throw new AppError("User has no push token registered", 400);
  }

  const message = {
    to: userData.expoPushToken,
    sound: "default" as const,
    title: "Test Notification",
    body: "A test notification",
    priority: "high" as const,
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new AppError(
      `Failed to send notification: ${response.statusText}`,
      response.status,
    );
  }

  const result = (await response.json()) as {
    data?: { status: string; id: string; message: string }[];
  };

  const error = result.data?.find((item) => item.status === "error");
  if (error) {
    throw new AppError(`Expo notification error: ${error.message}`, 500);
  }

  return { message: "Notification sent successfully", result };
}
