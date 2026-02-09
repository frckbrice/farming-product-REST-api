import User from "../models/user";
import { hashSync, compare } from "bcryptjs";
import { AppError } from "../errors";

export interface ShipAddress {
  id: string;
  title: string;
  address: string;
  default: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  address?: string;
  imageUrl?: string;
  addressID?: string;
  password?: string;
  shipAddress?: ShipAddress[];
  [key: string]: unknown;
}

export async function getAllUsers(): Promise<Record<string, unknown>[]> {
  const users = await User.findAll();
  if (!users?.length) {
    throw new AppError("No users found", 400);
  }
  return users.map((user) => {
    const { password: _password, ...userData } = user.toJSON();
    return userData as Record<string, unknown>;
  });
}

export async function getUserById(
  userId: string,
): Promise<Record<string, unknown>> {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("No such user found", 401);
  }
  const { password: _password, ...userData } = user.toJSON();
  return userData as Record<string, unknown>;
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput,
): Promise<{ message: string; userData: User }> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const currentShipAddress =
    typeof user.shipAddress === "string"
      ? (JSON.parse(user.shipAddress || "[]") as ShipAddress[])
      : (user.shipAddress as ShipAddress[]) || [];

  const updatedUserData: UpdateUserInput & { updatedAt: Date } = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.address && data.addressID) {
    const shipAddress = Array.isArray(currentShipAddress)
      ? [...currentShipAddress]
      : [];

    const addressIndex = shipAddress.findIndex(
      (addr) => addr.id === data.addressID,
    );
    if (addressIndex !== -1) {
      shipAddress[addressIndex] = {
        ...shipAddress[addressIndex],
        address: data.address,
      };
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

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  return {
    message: "Profile updated successfully",
    userData: updatedUser,
  };
}

export async function deleteUser(userId: string): Promise<{ message: string }> {
  const existingUser = await User.findOne({ where: { id: userId } });
  if (!existingUser) {
    throw new AppError("No such user found", 404);
  }
  await User.destroy({ where: { id: userId } });
  return { message: "User deleted successfully" };
}

export async function updatePassword(
  userId: string,
  password: string,
  oldPassword?: string,
): Promise<{ message: string }> {
  if (!password) {
    throw new AppError("Empty input fields", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const userData = await User.findOne({ where: { id: userId } });
  if (!userData) {
    throw new AppError("User not found", 404);
  }

  if (oldPassword) {
    const verifyPassword = await compare(
      oldPassword,
      userData.password as string,
    );
    if (!verifyPassword) {
      throw new AppError(
        "Current Password is incorrect. Please enter the correct current password",
        403,
      );
    }
  }

  const hashedPassword = hashSync(password, 10);
  await User.update(
    {
      password: hashedPassword,
      updatedAt: new Date(),
    },
    { where: { id: userId } },
  );

  return { message: "Password successfully updated" };
}

export async function updateShipAddress(
  userId: string,
  shipAddress: ShipAddress[],
): Promise<{ message: string; data: User }> {
  await User.update(
    { shipAddress, updatedAt: new Date() },
    { where: { id: userId } },
  );

  const userData = await User.findOne({ where: { id: userId } });
  if (!userData) {
    throw new AppError("User not found", 404);
  }

  return {
    message: "Shipping address updated successfully",
    data: userData,
  };
}

export async function addExpoPushToken(
  userId: string,
  expoPushToken: string,
): Promise<{ message: string }> {
  await User.update(
    { expoPushToken, updatedAt: new Date() },
    { where: { id: userId } },
  );
  return { message: "Push token saved successfully" };
}
