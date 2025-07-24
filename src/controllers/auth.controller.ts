import User from "../models/user";
import Role from "../models/role";
import UserOTPCode from "../models/userotpcode";
import { hashSync, compare } from "bcryptjs";
import { randomInt } from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { Readable } from "stream";
import AppError from "../errors/customErrors";

// Type definitions
interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyPhoneRequest {
  phoneNum: string;
  password: string;
  country: string;
  email: string;
  userRole: string;
}

interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  address: string;
  expoPushToken?: string;
}

interface ShippingAddress {
  id: string;
  title: string;
  address: string;
  default: boolean;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface AuthHandlerRequest {
  googleToken?: string;
  facebookToken?: string;
}

interface SendOtpRequest {
  email: string;
}

interface GooglePayload {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const googleClient = new OAuth2Client(process.env.GMAIL_AUTH_CLIENTID);

// Utility function for generating OTP
const generateOTP = () => randomInt(1000, 9999).toString();

// Utility function for sending OTP
const sendOTP = async (email: string, otp: string, phone: string) => {
  if (email) {
    const transporter = nodemailer.createTransport({
      service: process.env.FARMING_PRODUCTS_PROVIDER,
      host: process.env.FARMING_PRODUCTS_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Farming products <farmingproductscmr@gmail.com>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h1>Farming products</h1>
        <p>Hello ${email},</p>
        <p>Enter <b>${otp}</b> in the app to verify your email address and complete verification:</p>
        <p>This code <b>expires in 10 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br>Farming products Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

  if (phone) {
    const data = {
      user: process.env.FARMING_PRODUCTS_SMS_USER,
      password: process.env.FARMING_PRODUCTS_SMS_PASSWORD,
      senderid: "Farming products",
      sms: `Farming products. Your OTP is ${otp}, valid for 10 minutes only.`,
      mobiles: phone,
    };

    const config = {
      method: "post",
      url: "https://smsvas.com/bulk/public/index.php/api/v1/sendsms",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    await axios.request(config);
  }
};

// Verify Phone and Handle Registration
export const verifyPhone = async (
  req: Request<unknown, unknown, VerifyPhoneRequest>,
  res: Response,
) => {
  const { phoneNum, password, country, email, userRole } = req.body;

  // Input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "FAILED", message: "Empty input fields" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "FAILED",
      message: "Password must be at least 8 characters",
    });
  }

  if (!/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res
      .status(400)
      .json({ status: "FAILED", message: "Invalid email entered" });
  }

  const validRoles = ["buyer", "farmer"] as const;
  if (
    !userRole ||
    !validRoles.includes(userRole as (typeof validRoles)[number])
  ) {
    return res.status(400).json({
      status: "FAILED",
      message: `Invalid role: ${userRole}. Valid roles are: ${validRoles.join(", ")}`,
    });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    // Find or create role
    let role = await Role.findOne({ where: { roleName: userRole } });
    if (!role) {
      role = await Role.create({ roleName: userRole });
    }

    // Hash password
    const hashedPassword = hashSync(password.trim(), 10);

    // Create user
    const user = await User.create({
      roleId: role.id,
      email,
      password: hashedPassword,
      country,
      phoneNum: parseInt(phoneNum, 10) || 0,
      firstName: "",
      lastName: "",
      imageUrl: "",
      address: "",
      googleId: "",
      verifiedUser: false,
      vip: false,
      facebookId: "",
      shipAddress: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!user) {
      throw new AppError("Failed to create user during registration", 500);
    }

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOtp = hashSync(otp, 10);

    // Create OTP object
    const otpObj = await UserOTPCode.create({
      userId: user.id,
      otp: hashedOtp,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!otpObj) {
      throw new AppError("Failed to create OTP in the database", 500);
    }

    // Send OTP via email and/or SMS
    await sendOTP(email, otp, phoneNum);

    // Return success response
    return res.status(200).json({
      message: "OTP sent successfully, please verify the OTP",
      email: user.email,
      phoneNum: user.phoneNum,
      userID: user.id,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// Register User
export const register_user = async (
  req: Request<{ userId: string }, unknown, RegisterUserRequest>,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.file = {
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
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();

    const shippAddress: ShippingAddress[] = [
      {
        id: uuidv4(),
        title: "Home",
        address,
        default: true,
      },
    ];

    let imageUrl = "";
    if (req.file) {
      const cloudinaryImageUpload = await cloudinary.uploader.upload(
        req.file.path,
      );
      imageUrl = cloudinaryImageUpload.secure_url;
    }

    await User.update(
      {
        firstName,
        lastName,
        address,
        imageUrl,
        shipAddress: shippAddress,
        expoPushToken,
        updatedAt: new Date(),
      },
      { where: { id: userId } },
    );

    return res.status(200).json({ message: "User successfully registered" });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
export const verifyOtp = async (
  req: Request<unknown, unknown, VerifyOtpRequest>,
  res: Response,
) => {
  const { email, otp } = req.body;

  try {
    const currentUser = await User.findOne({ where: { email } });
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "The User does not exist. Please sign up!" });
    }

    const getOtp = await UserOTPCode.findOne({
      where: { userId: currentUser.id },
    });
    if (!getOtp) {
      return res.status(404).json({
        message: "Server Error! Please Try Again Later by signing up.",
      });
    }

    const { expiredAt } = getOtp;
    if (expiredAt < Date.now()) {
      await UserOTPCode.destroy({ where: { userId: currentUser.id } });
      return res
        .status(404)
        .json({ message: "Code has expired. Please request again" });
    }

    const validOtp = await compare(otp, getOtp.otp);
    if (validOtp) {
      await UserOTPCode.destroy({ where: { userId: currentUser.id } });
      await User.update({ verifiedUser: true }, { where: { email } });

      currentUser.password = null;
      return res
        .status(200)
        .json({ message: "Successfully verified!", userId: currentUser.id });
    } else {
      return res.status(403).json({ message: "Wrong OTP" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Internal Server Error!",
        error: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

// Login
export const logIn = async (
  req: Request<unknown, unknown, LoginRequest>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

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
      {
        UserId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      {
        UserId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET_REFRESH as string,
      { expiresIn: "7d" },
    );

    user.password = null;

    res.status(200).json({
      message: "Authentication Successful",
      token,
      refreshToken,
      userData: user,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "You are either not logged in or your session has expired",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify and decode the token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_REFRESH as string,
    ) as jwt.JwtPayload;

    if (!decodedToken.exp) {
      return res.status(403).json({
        auth: false,
        message: "Token does not have an expiration time",
      });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { UserId: decodedToken.UserId, email: decodedToken.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    return res
      .status(200)
      .json({ message: "Token refreshed successfully", token: accessToken });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ message: "Invalid token, please login again" });
    }
    next(error);
  }
};

// Auth Handler (Google and Facebook Auth)
export const authHandler = async (
  req: Request<unknown, unknown, AuthHandlerRequest>,
  res: Response,
  next: NextFunction,
) => {
  const { googleToken, facebookToken } = req.body;

  try {
    if (!googleToken && !facebookToken) {
      return res.status(400).json({ message: "Missing authentication token" });
    }

    // Ensure the 'buyer' role exists
    let role = await Role.findOne({ where: { roleName: "buyer" } });
    if (!role) {
      role = await Role.create({ roleName: "buyer" });
    }

    let user;

    // Google Authentication
    if (googleToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GMAIL_AUTH_CLIENTID,
      });

      const payload = ticket.getPayload() as GooglePayload | undefined;
      if (!payload) {
        return res.status(401).json({ message: "Invalid Google token" });
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
          return res
            .status(400)
            .json({ message: "Please use your exact email ID to sign in" });
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
          phoneNum: 0,
          country: "",
          vip: false,
          verifiedUser: false,
          facebookId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Facebook Authentication
    else if (facebookToken) {
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
        return res
          .status(400)
          .json({ message: "Facebook account must have an email" });
      }

      const [firstName] = name.split(" ");
      const lastName = name.split(" ")[1] || "";

      user = await User.findOne({ where: { email } });

      if (user) {
        if (!user.facebookId) {
          user.facebookId = facebookId;
          await user.save();
        } else if (user.facebookId !== facebookId) {
          return res
            .status(400)
            .json({ message: "Please use your exact email ID to sign in" });
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
          phoneNum: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    if (!user) {
      return res
        .status(500)
        .json({ message: "User creation failed. Please try again." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { UserId: user.id, email: user.email, roleId: user.roleId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// send new OTP
export const sendNewOTP = async (
  req: Request<unknown, unknown, SendOtpRequest>,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message:
          "This email is not registered. Please enter the email with which you have registered your account!",
      });
    }

    const code = generateOTP();

    // Send OTP message
    await sendOTP(email, code, user.phoneNum?.toString() || "");

    // Save OTP to the database
    const hashedOtp = hashSync(code, 10);
    const otpObj = await UserOTPCode.create({
      userId: user.id,
      otp: hashedOtp,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!otpObj) {
      throw new AppError("Failed to create OTP in the database", 500);
    }

    // Return result
    return res.status(200).json({
      message: "OTP sent successfully, please verify the OTP",
      userID: user.id,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};
