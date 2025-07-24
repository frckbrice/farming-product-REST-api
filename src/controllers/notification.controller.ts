import Notification from "../models/notifiation";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/customErrors";

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

interface CreateNotificationRequest {
  title: string;
  message: string;
}

// Get all notifications for a user
export const getNotification = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;

  try {
    const allNotifications = await Notification.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
      },
    });

    res.status(200).json({
      notifications: allNotifications,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new notification
export const createNotification = async (
  req: Request<{ userId: string }, unknown, CreateNotificationRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;
  const { title, message } = req.body;

  try {
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

    res.status(200).json({
      result: notification,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

// Mark a notification as read
export const markAsRead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id: notificationId } = req.params;

  try {
    const [updatedCount] = await Notification.update(
      { isRead: true, updatedAt: new Date() },
      { where: { id: notificationId } },
    );

    if (updatedCount === 0) {
      throw new AppError("Notification not found", 404);
    }

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

// Test Expo notification
export const testExpoNotification = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;

  try {
    const userData = await User.findOne({ where: { id: userId } });
    if (!userData) {
      throw new AppError("User not found", 404);
    }

    if (!userData.expoPushToken) {
      throw new AppError("User has no push token registered", 400);
    }

    const message: ExpoMessage = {
      to: userData.expoPushToken,
      sound: "default",
      title: "Test Notification",
      body: "A test notification",
      priority: "high",
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

    const result = (await response.json()) as ExpoResponse;

    // Check for errors in the response
    const error = result.data?.find((item) => item.status === "error");
    if (error) {
      throw new AppError(`Expo notification error: ${error.message}`, 500);
    }

    res.status(200).json({
      message: "Notification sent successfully",
      result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
