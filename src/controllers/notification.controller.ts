import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import * as notificationService from "../services/notification.service";

export const getNotification = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const allNotifications = await notificationService.getNotificationsByUserId(
      req.params.userId,
    );
    res.status(200).json({ notifications: allNotifications });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (
  req: Request<
    { userId: string },
    unknown,
    notificationService.CreateNotificationInput
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const notification = await notificationService.createNotification(
      req.params.userId,
      req.body,
    );
    res.status(200).json({ result: notification });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const markAsRead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.markNotificationAsRead(
      req.params.id,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const testExpoNotification = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await notificationService.sendTestExpoNotification(
      req.params.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
