"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewOTP = exports.authHandler = exports.refreshToken = exports.logIn = exports.verifyOtp = exports.register_user = exports.verifyPhone = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const role_1 = tslib_1.__importDefault(require("../models/role"));
const userotpcode_1 = tslib_1.__importDefault(require("../models/userotpcode"));
const bcryptjs_1 = require("bcryptjs");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const nodemailer_1 = tslib_1.__importDefault(require("nodemailer"));
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
const google_auth_library_1 = require("google-auth-library");
const axios_1 = tslib_1.__importDefault(require("axios"));
const stream_1 = require("stream");
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Configure cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GMAIL_AUTH_CLIENTID);
// Utility function for generating OTP
const generateOTP = () => (0, crypto_1.randomInt)(1000, 9999).toString();
// Utility function for sending OTP
const sendOTP = (email, otp, phone) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(mailOptions);
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
        yield axios_1.default.request(config);
    }
});
// Verify Phone and Handle Registration
const verifyPhone = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
    const validRoles = ["buyer", "farmer"];
    if (!userRole || !validRoles.includes(userRole)) {
        return res.status(400).json({
            status: "FAILED",
            message: `Invalid role: ${userRole}. Valid roles are: ${validRoles.join(", ")}`,
        });
    }
    try {
        // Check if user already exists
        const userExists = yield user_1.default.findOne({ where: { email } });
        if (userExists) {
            return res
                .status(400)
                .json({ message: "This email is already registered." });
        }
        // Find or create role
        let role = yield role_1.default.findOne({ where: { roleName: userRole } });
        if (!role) {
            role = yield role_1.default.create({ roleName: userRole });
        }
        // Hash password
        const hashedPassword = (0, bcryptjs_1.hashSync)(password.trim(), 10);
        // Create user
        const user = yield user_1.default.create({
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
            throw new customErrors_1.default("Failed to create user during registration", 500);
        }
        // Generate and store OTP
        const otp = generateOTP();
        const hashedOtp = (0, bcryptjs_1.hashSync)(otp, 10);
        // Create OTP object
        const otpObj = yield userotpcode_1.default.create({
            userId: user.id,
            otp: hashedOtp,
            expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (!otpObj) {
            throw new customErrors_1.default("Failed to create OTP in the database", 500);
        }
        // Send OTP via email and/or SMS
        yield sendOTP(email, otp, phoneNum);
        // Return success response
        return res.status(200).json({
            message: "OTP sent successfully, please verify the OTP",
            email: user.email,
            phoneNum: user.phoneNum,
            userID: user.id,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
});
exports.verifyPhone = verifyPhone;
// Register User
const register_user = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    req.file = {
        path: "https://randomuser.me/api/portraits/men/1.jpg",
        originalname: "profile.jpg",
        mimetype: "image/jpeg",
        size: 12345,
        fieldname: "image",
        encoding: "7bit",
        stream: new stream_1.Readable(),
        destination: "",
        buffer: Buffer.from([]),
        filename: "profile.jpg",
    };
    const { userId } = req.params;
    const { address, expoPushToken } = req.body;
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const shippAddress = [
        {
            id: (0, uuid_1.v4)(),
            title: "Home",
            address,
            default: true,
        },
    ];
    try {
        let imageUrl = "";
        if (req.file) {
            const cloudinaryImageUpload = yield cloudinary_1.v2.uploader.upload(req.file.path);
            imageUrl = cloudinaryImageUpload.secure_url;
        }
        yield user_1.default.update({
            firstName,
            lastName,
            address,
            imageUrl,
            shipAddress: shippAddress,
            expoPushToken,
            updatedAt: new Date(),
        }, { where: { id: userId } });
        return res.status(200).json({ message: "User successfully registered" });
    }
    catch (error) {
        next(error);
    }
});
exports.register_user = register_user;
// Verify OTP
const verifyOtp = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const currentUser = yield user_1.default.findOne({ where: { email } });
        if (!currentUser) {
            return res
                .status(401)
                .json({ message: "The User does not exist. Please sign up!" });
        }
        const getOtp = yield userotpcode_1.default.findOne({
            where: { userId: currentUser.id },
        });
        if (!getOtp) {
            return res.status(404).json({
                message: "Server Error! Please Try Again Later by signing up.",
            });
        }
        const { expiredAt } = getOtp;
        if (expiredAt < Date.now()) {
            yield userotpcode_1.default.destroy({ where: { userId: currentUser.id } });
            return res
                .status(404)
                .json({ message: "Code has expired. Please request again" });
        }
        const validOtp = yield (0, bcryptjs_1.compare)(otp, getOtp.otp);
        if (validOtp) {
            yield userotpcode_1.default.destroy({ where: { userId: currentUser.id } });
            yield user_1.default.update({ verifiedUser: true }, { where: { email } });
            currentUser.password = null;
            return res
                .status(200)
                .json({ message: "Successfully verified!", userId: currentUser.id });
        }
        else {
            return res.status(403).json({ message: "Wrong OTP" });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: "Internal Server Error!",
                error: error.message
            });
        }
        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
});
exports.verifyOtp = verifyOtp;
// Login
const logIn = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({
            where: { email },
            include: [
                {
                    model: role_1.default,
                    attributes: ["roleName"],
                },
            ],
        });
        if (!user) {
            return res
                .status(403)
                .json({ message: "No user exists for this email address" });
        }
        const verifyPassword = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!verifyPassword) {
            return res.status(403).json({ message: "Incorrect Password" });
        }
        const token = jsonwebtoken_1.default.sign({
            UserId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({
            UserId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET_REFRESH, { expiresIn: "7d" });
        user.password = null;
        res.status(200).json({
            message: "Authentication Successful",
            token,
            refreshToken,
            userData: user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: "error", message: error.message });
        }
        else {
            res.status(500).json({ error: "error", message: "An unexpected error occurred" });
        }
    }
});
exports.logIn = logIn;
// Refresh Token
const refreshToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_REFRESH);
        if (!decodedToken.exp) {
            return res.status(403).json({
                auth: false,
                message: "Token does not have an expiration time",
            });
        }
        // Generate a new access token
        const accessToken = jsonwebtoken_1.default.sign({ UserId: decodedToken.UserId, email: decodedToken.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res
            .status(200)
            .json({ message: "Token refreshed successfully", token: accessToken });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res
                .status(401)
                .json({ message: "Invalid token, please login again" });
        }
        next(error);
    }
});
exports.refreshToken = refreshToken;
// Auth Handler (Google and Facebook Auth)
const authHandler = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { googleToken, facebookToken } = req.body;
    try {
        if (!googleToken && !facebookToken) {
            return res.status(400).json({ message: "Missing authentication token" });
        }
        // Ensure the 'buyer' role exists
        let role = yield role_1.default.findOne({ where: { roleName: "buyer" } });
        if (!role) {
            role = yield role_1.default.create({ roleName: "buyer" });
        }
        let user;
        // Google Authentication
        if (googleToken) {
            const ticket = yield googleClient.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GMAIL_AUTH_CLIENTID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(401).json({ message: "Invalid Google token" });
            }
            const { sub: googleId, email = "", given_name: firstName = "", family_name: lastName = "", picture: imageUrl = "", } = payload;
            user = yield user_1.default.findOne({ where: { email } });
            if (user) {
                if (!user.googleId) {
                    user.googleId = googleId;
                    yield user.save();
                }
                else if (user.googleId !== googleId) {
                    return res
                        .status(400)
                        .json({ message: "Please use your exact email ID to sign in" });
                }
            }
            else {
                user = yield user_1.default.create({
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
            const response = yield axios_1.default.get(`https://graph.facebook.com/me?access_token=${facebookToken}&fields=id,name,email,picture`);
            const { id: facebookId, name, email } = response.data;
            if (!email) {
                return res
                    .status(400)
                    .json({ message: "Facebook account must have an email" });
            }
            const [firstName] = name.split(" ");
            const lastName = name.split(" ")[1] || "";
            user = yield user_1.default.findOne({ where: { email } });
            if (user) {
                if (!user.facebookId) {
                    user.facebookId = facebookId;
                    yield user.save();
                }
                else if (user.facebookId !== facebookId) {
                    return res
                        .status(400)
                        .json({ message: "Please use your exact email ID to sign in" });
                }
            }
            else {
                user = yield user_1.default.create({
                    facebookId,
                    email,
                    firstName,
                    lastName,
                    roleId: role.id,
                    country: "",
                    address: "",
                    shipAddress: [],
                    googleId: "",
                    imageUrl: ((_a = response.data.picture) === null || _a === void 0 ? void 0 : _a.data.url) || "",
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
        const token = jsonwebtoken_1.default.sign({ UserId: user.id, email: user.email, roleId: user.roleId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authHandler = authHandler;
// send new OTP
const sendNewOTP = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({
                message: "This email is not registered. Please enter the email with which you have registered your account!",
            });
        }
        const code = generateOTP();
        // Send OTP message
        yield sendOTP(email, code, ((_a = user.phoneNum) === null || _a === void 0 ? void 0 : _a.toString()) || "");
        // Save OTP to the database
        const hashedOtp = (0, bcryptjs_1.hashSync)(code, 10);
        const otpObj = yield userotpcode_1.default.create({
            userId: user.id,
            otp: hashedOtp,
            expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (!otpObj) {
            throw new customErrors_1.default("Failed to create OTP in the database", 500);
        }
        // Return result
        return res.status(200).json({
            message: "OTP sent successfully, please verify the OTP",
            userID: user.id,
            email: user.email,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
});
exports.sendNewOTP = sendNewOTP;
