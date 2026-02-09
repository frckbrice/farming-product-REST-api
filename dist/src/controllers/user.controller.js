"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpoPushNotificationToken = exports.updateShipAddress = exports.updatePassword = exports.deleteUser = exports.updateUser = exports.getUserData = exports.getAllUserData = void 0;
const tslib_1 = require("tslib");
const cloudinary_1 = require("cloudinary");
const errors_1 = require("../errors");
const userService = tslib_1.__importStar(require("../services/user.service"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const getAllUserData = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getAllUsers();
        res.status(200).json(users);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving users",
        });
    }
});
exports.getAllUserData = getAllUserData;
const getUserData = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield userService.getUserById(req.params.userId);
        res.status(200).json(userData);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving user",
        });
    }
});
exports.getUserData = getUserData;
const updateUser = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.params.userId;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const upload = yield cloudinary_1.v2.uploader.upload(req.file.path);
            req.body.imageUrl = upload.secure_url;
        }
        const result = yield userService.updateUser(userId, req.body);
        res.status(200).json({
            message: result.message,
            userData: result.userData,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.deleteUser(req.params.userId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting user",
        });
    }
});
exports.deleteUser = deleteUser;
const updatePassword = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, userId, oldPassword } = req.body;
        const result = yield userService.updatePassword(userId, password, oldPassword);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({
                status: "FAILED",
                message: error.message,
            });
            return;
        }
        next(error);
    }
});
exports.updatePassword = updatePassword;
const updateShipAddress = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.updateShipAddress(req.params.userId, req.body);
        res.status(200).json({
            message: result.message,
            data: result.data,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateShipAddress = updateShipAddress;
const addExpoPushNotificationToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.addExpoPushToken(req.params.userId, req.body.expoPushToken);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.addExpoPushNotificationToken = addExpoPushNotificationToken;
