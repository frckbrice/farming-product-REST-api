import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Readable } from "stream";
import { AppError } from "../errors";
import * as authService from "../services/auth.service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const verifyPhone = async (
  req: Request<unknown, unknown, authService.VerifyPhoneInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.verifyPhone(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(new AppError(error.message, error.statusCode));
      return;
    }
    next(new AppError("An unexpected error occurred", 500));
  }
};

export const register_user = async (
  req: Request<{ userId: string }, unknown, authService.RegisterUserInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    req.file = req.file ?? {
      path: "https://randomuser.me/api/portraits/men/1.jpg",
      originalname: "profile.jpg",
      mimetype: "image/jpeg",
      size: 12345,
      fieldname: "image",
      encoding: "7bit",
      stream: new Readable(),
      destination: "",
      buffer: Buffer.from([]),
      filename: "profile.jpg",
    };

    const { userId } = req.params;
    const { address, expoPushToken } = req.body;
    const firstName = req.body.firstName?.trim() ?? "";
    const lastName = req.body.lastName?.trim() ?? "";

    let imageUrl = "";
    if (req.file?.path) {
      const cloudinaryImageUpload = await cloudinary.uploader.upload(
        req.file.path,
      );
      imageUrl = cloudinaryImageUpload.secure_url;
    }

    const result = await authService.registerUser(userId, {
      firstName,
      lastName,
      address,
      expoPushToken,
      imageUrl,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// --- OTP verification disabled: keeping authentication simple ---
// export const verifyOtp = async (
//   req: Request<unknown, unknown, authService.VerifyOtpInput>,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const result = await authService.verifyOtp(req.body);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error instanceof AppError) {
//       next(new AppError(error.message, error.statusCode));
//       return;
//     }
//     next(new AppError("An unexpected error occurred", 500));
//   }
// };

export const logIn = async (
  req: Request<unknown, unknown, authService.LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.logIn(req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(new AppError(error.message, error.statusCode));
      return;
    }
    next(new AppError("An unexpected error occurred", 500));
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.refreshToken(req.headers.authorization);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token, please login again" });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const authHandler = async (
  req: Request<unknown, unknown, authService.AuthHandlerInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.authHandler(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// --- OTP send disabled: keeping authentication simple ---
// export const sendNewOTP = async (
//   req: Request<unknown, unknown, authService.SendOtpInput>,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const result = await authService.sendNewOTP(req.body);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error instanceof AppError) {
//       next(new AppError(error.message, error.statusCode));
//       return;
//     }
//     next(new AppError("An unexpected error occurred", 500));
//   }
// };
