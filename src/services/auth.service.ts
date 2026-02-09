import User from "../models/user";
import Role from "../models/role";
import { hashSync, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../errors";

const googleClient = new OAuth2Client(process.env.GMAIL_AUTH_CLIENTID);

export interface VerifyPhoneInput {
  phoneNum: string;
  password: string;
  country: string;
  email: string;
  userRole: string;
}

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  address: string;
  expoPushToken?: string;
  imageUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// --- OTP auth disabled: keeping authentication simple ---
// export interface VerifyOtpInput {
//   email: string;
//   otp: string;
// }

export interface AuthHandlerInput {
  googleToken?: string;
  facebookToken?: string;
}

// export interface SendOtpInput {
//   email: string;
// }

interface GooglePayload {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function verifyPhone(data: VerifyPhoneInput): Promise<{
  message: string;
  email: string;
  userID: string;
}> {
  const { phoneNum, password, country, email, userRole } = data;

  if (!email || !password) {
    throw new AppError("Empty input fields", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  if (!/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    throw new AppError("Invalid email entered", 400);
  }

  const validRoles = ["buyer", "farmer"] as const;
  if (
    !userRole ||
    !validRoles.includes(userRole as (typeof validRoles)[number])
  ) {
    throw new AppError(
      `Invalid role: ${userRole}. Valid roles are: ${validRoles.join(", ")}`,
      400,
    );
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new AppError("This email is already registered.", 409);
  }

  let role = await Role.findOne({ where: { roleName: userRole } });
  if (!role) {
    role = await Role.create({ roleName: userRole });
  }

  const hashedPassword = hashSync(password.trim(), 10);

  const user = await User.create({
    roleId: role.id,
    email,
    password: hashedPassword,
    country,
    phoneNum: phoneNum?.trim() || "",
    firstName: "",
    lastName: "",
    imageUrl: "",
    address: "",
    googleId: "",
    verifiedUser: true,
    vip: false,
    facebookId: "",
    shipAddress: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!user) {
    throw new AppError("Failed to create user during registration", 500);
  }

  return {
    message:
      "Registration successful. Complete your profile or log in with your email and password.",
    email: user.email,
    userID: user.id,
  };
}

export async function registerUser(
  userId: string,
  data: RegisterUserInput,
): Promise<{ message: string }> {
  const { firstName, lastName, address, expoPushToken, imageUrl } = data;

  const shippAddress = [
    {
      id: uuidv4(),
      title: "Home",
      address,
      default: true,
    },
  ];

  await User.update(
    {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address,
      imageUrl: imageUrl ?? "",
      shipAddress: shippAddress,
      expoPushToken,
      updatedAt: new Date(),
    },
    { where: { id: userId } },
  );

  return { message: "User successfully registered" };
}

// --- OTP verification disabled: keeping authentication simple ---
// export async function verifyOtp(
//   _data: VerifyOtpInput,
// ): Promise<{ message: string }> {
//   return {
//     message: "Please log in with your email and password.",
//   };
// }

export async function logIn(data: LoginInput): Promise<{
  message: string;
  token: string;
  refreshToken: string;
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    verifiedUser: boolean;
    role: string | undefined;
  };
}> {
  const { email, password } = data;

  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        attributes: ["roleName"],
      },
    ],
  });

  if (!user) {
    throw new AppError("No user exists for this email address", 403);
  }

  const verifyPassword = await compare(password, user.password as string);
  if (!verifyPassword) {
    throw new AppError("Incorrect Password", 403);
  }

  const token = jwt.sign(
    { UserId: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  const refreshToken = jwt.sign(
    { UserId: user.id, email: user.email },
    process.env.JWT_SECRET_REFRESH as string,
    { expiresIn: "7d" },
  );

  const userData = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    verifiedUser: user.verifiedUser,
    role: user.role?.roleName,
  };

  return {
    message: "Authentication Successful",
    token,
    refreshToken,
    userData,
  };
}

export async function refreshToken(authHeader: string | undefined): Promise<{
  message: string;
  token: string;
}> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      "You are either not logged in or your session has expired",
      401,
    );
  }

  const token = authHeader.split(" ")[1];

  const decodedToken = jwt.verify(
    token,
    process.env.JWT_SECRET_REFRESH as string,
  ) as jwt.JwtPayload & { UserId: string; email: string };

  if (!decodedToken.exp) {
    throw new AppError("Token does not have an expiration time", 403);
  }

  const accessToken = jwt.sign(
    { UserId: decodedToken.UserId, email: decodedToken.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  return {
    message: "Token refreshed successfully",
    token: accessToken,
  };
}

export async function authHandler(data: AuthHandlerInput): Promise<{
  message: string;
  token: string;
  user: User;
}> {
  const { googleToken, facebookToken } = data;

  if (!googleToken && !facebookToken) {
    throw new AppError("Missing authentication token", 400);
  }

  let role = await Role.findOne({ where: { roleName: "buyer" } });
  if (!role) {
    role = await Role.create({ roleName: "buyer" });
  }

  let user: User | null = null;

  if (googleToken) {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GMAIL_AUTH_CLIENTID,
    });

    const payload = ticket.getPayload() as GooglePayload | undefined;
    if (!payload) {
      throw new AppError("Invalid Google token", 401);
    }

    const {
      sub: googleId,
      email = "",
      given_name: firstName = "",
      family_name: lastName = "",
      picture: imageUrl = "",
    } = payload;

    user = await User.findOne({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      } else if (user.googleId !== googleId) {
        throw new AppError(
          "Please use your exact email ID to sign in",
          400,
        );
      }
    } else {
      user = await User.create({
        googleId,
        email,
        firstName,
        lastName,
        imageUrl,
        roleId: role.id,
        shipAddress: [],
        address: "",
        phoneNum: "",
        country: "",
        vip: false,
        verifiedUser: false,
        facebookId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } else if (facebookToken) {
    const response = await axios.get<{
      id: string;
      name: string;
      email: string;
      picture?: { data: { url: string } };
    }>(
      `https://graph.facebook.com/me?access_token=${facebookToken}&fields=id,name,email,picture`,
    );

    const { id: facebookId, name, email } = response.data;

    if (!email) {
      throw new AppError(
        "Facebook account must have an email",
        400,
      );
    }

    const [firstName] = name.split(" ");
    const lastName = name.split(" ")[1] || "";

    user = await User.findOne({ where: { email } });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = facebookId;
        await user.save();
      } else if (user.facebookId !== facebookId) {
        throw new AppError(
          "Please use your exact email ID to sign in",
          400,
        );
      }
    } else {
      user = await User.create({
        facebookId,
        email,
        firstName,
        lastName,
        roleId: role.id,
        country: "",
        address: "",
        shipAddress: [],
        googleId: "",
        imageUrl: response.data.picture?.data.url || "",
        vip: false,
        verifiedUser: false,
        phoneNum: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  if (!user) {
    throw new AppError(
      "User creation failed. Please try again.",
      500,
    );
  }

  const token = jwt.sign(
    { UserId: user.id, email: user.email, roleId: user.roleId },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  return {
    message: "User logged in successfully",
    token,
    user,
  };
}

// --- OTP send disabled: keeping authentication simple ---
// export async function sendNewOTP(
//   _data: SendOtpInput,
// ): Promise<{ message: string }> {
//   return {
//     message: "Use your email and password to log in.",
//   };
// }
