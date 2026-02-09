"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHandler = exports.refreshToken = exports.logIn = exports.register_user = exports.verifyPhone = void 0;
const tslib_1 = require("tslib");
const cloudinary_1 = require("cloudinary");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const stream_1 = require("stream");
const errors_1 = require("../errors");
const authService = tslib_1.__importStar(require("../services/auth.service"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const verifyPhone = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.verifyPhone(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            next(new errors_1.AppError(error.message, error.statusCode));
            return;
        }
        next(new errors_1.AppError("An unexpected error occurred", 500));
    }
});
exports.verifyPhone = verifyPhone;
const register_user = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        req.file = (_a = req.file) !== null && _a !== void 0 ? _a : {
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
        const firstName = (_c = (_b = req.body.firstName) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
        const lastName = (_e = (_d = req.body.lastName) === null || _d === void 0 ? void 0 : _d.trim()) !== null && _e !== void 0 ? _e : "";
        let imageUrl = "";
        if ((_f = req.file) === null || _f === void 0 ? void 0 : _f.path) {
            const cloudinaryImageUpload = yield cloudinary_1.v2.uploader.upload(req.file.path);
            imageUrl = cloudinaryImageUpload.secure_url;
        }
        const result = yield authService.registerUser(userId, {
            firstName,
            lastName,
            address,
            expoPushToken,
            imageUrl,
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.register_user = register_user;
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
const logIn = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.logIn(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            next(new errors_1.AppError(error.message, error.statusCode));
            return;
        }
        next(new errors_1.AppError("An unexpected error occurred", 500));
    }
});
exports.logIn = logIn;
const refreshToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.refreshToken(req.headers.authorization);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res
                .status(401)
                .json({ message: "Invalid token, please login again" });
            return;
        }
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.refreshToken = refreshToken;
const authHandler = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.authHandler(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.authHandler = authHandler;
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
