import User from "../models/user";
import { hashSync, compare } from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";

interface CloudinaryResponse {
  secure_url: string;
}

interface ShipAddress {
  id: string;
  title: string;
  address: string;
  default: boolean;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// get all user data
export const getAllUserData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll();
    if (!users?.length) {
      res.status(400).json({ message: "No users found" });
      return;
    }

    // remove password field from output
    const usersWithoutPassword = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userData } = user.toJSON();
      return userData;
    });

    res.status(200).json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Error retrieving users",
    });
  }
};

// get a user data
export const getUserData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.userId;

  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(401).json({ message: "No such user found" });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user.toJSON();

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error retrieving user",
    });
  }
};

// Update a user's data
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (req.file) {
      const cloudinaryResponse = (await cloudinary.uploader.upload(
        req.file.path,
      )) as CloudinaryResponse;
      req.body.imageUrl = cloudinaryResponse.secure_url;
    }

    const updatedUserData = {
      ...req.body,
      updatedAt: new Date(),
    };

    if (req.body.address && req.body.addressID) {
      let shipAddress: ShipAddress[] = [];
      const currentShipAddress =
        typeof user.shipAddress === "string"
          ? JSON.parse(user.shipAddress || "[]")
          : (user.shipAddress as ShipAddress[]) || [];

      shipAddress = Array.isArray(currentShipAddress) ? currentShipAddress : [];

      const addressIndex = shipAddress.findIndex(
        (addr) => addr.id === req.body.addressID,
      );

      if (addressIndex !== -1) {
        shipAddress[addressIndex].address = req.body.address;
        updatedUserData.shipAddress = shipAddress;
      }
    }

    if (updatedUserData.password) {
      updatedUserData.password = hashSync(updatedUserData.password, 10);
    }

    await User.update(updatedUserData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// delete a user
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const existingUser = await User.findOne({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ message: "No such user found" });
      return;
    }

    await User.destroy({ where: { id: userId } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error deleting user",
    });
  }
};

// update password
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { password, userId, oldPassword } = req.body;

  if (!password) {
    res.status(400).json({
      status: "FAILED",
      message: "Empty input fields",
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({
      status: "FAILED",
      message: "Password must be at least 8 characters",
    });
    return;
  }

  try {
    const userData = await User.findOne({ where: { id: userId } });
    if (!userData) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (oldPassword) {
      const verifyPassword = await compare(
        oldPassword,
        userData.password as string,
      );
      if (!verifyPassword) {
        res.status(403).json({
          message:
            "Current Password is incorrect. Please enter the correct current password",
        });
        return;
      }
    }

    const hashedPassword = hashSync(password, 10);
    userData.password = hashedPassword;
    userData.updatedAt = new Date();

    await User.update(userData, { where: { id: userId } });
    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    next(error);
  }
};

export const updateShipAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;

  try {
    await User.update(
      {
        shipAddress: req.body,
        updatedAt: new Date(),
      },
      { where: { id: userId } },
    );

    const userData = await User.findOne({ where: { id: userId } });

    res.status(200).json({
      message: "Shipping address updated successfully",
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const addExpoPushNotificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { userId } = req.params;
  const { expoPushToken } = req.body;

  try {
    await User.update(
      {
        expoPushToken,
        updatedAt: new Date(),
      },
      { where: { id: userId } },
    );

    res.status(200).json({ message: "Push token saved successfully" });
  } catch (error) {
    next(error);
  }
};
