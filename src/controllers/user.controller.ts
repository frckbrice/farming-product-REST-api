import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";
import { AppError } from "../errors";
import * as userService from "../services/user.service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getAllUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error retrieving users",
    });
  }
};

export const getUserData = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userData = await userService.getUserById(req.params.userId);
    res.status(200).json(userData);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error retrieving user",
    });
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userId;
    if (req.file?.path) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      req.body.imageUrl = upload.secure_url;
    }
    const result = await userService.updateUser(userId, req.body);
    res.status(200).json({
      message: result.message,
      userData: result.userData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await userService.deleteUser(req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error deleting user",
    });
  }
};

export const updatePassword = async (
  req: Request<unknown, unknown, { password: string; userId: string; oldPassword?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password, userId, oldPassword } = req.body;
    const result = await userService.updatePassword(userId, password, oldPassword);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: "FAILED",
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const updateShipAddress = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await userService.updateShipAddress(
      req.params.userId,
      req.body,
    );
    res.status(200).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const addExpoPushNotificationToken = async (
  req: Request<{ userId: string }, unknown, { expoPushToken: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await userService.addExpoPushToken(
      req.params.userId,
      req.body.expoPushToken,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
