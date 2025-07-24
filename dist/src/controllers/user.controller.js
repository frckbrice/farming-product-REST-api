"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExpoPushNotificationToken = exports.updateShipAddress = exports.updatePassword = exports.deleteUser = exports.updateUser = exports.getUserData = exports.getAllUserData = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const bcryptjs_1 = require("bcryptjs");
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// get all user data
const getAllUserData = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll();
        if (!(users === null || users === void 0 ? void 0 : users.length)) {
            res.status(400).json({ message: "No users found" });
            return;
        }
        // remove password field from output
        const usersWithoutPassword = users.map(user => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _a = user.toJSON(), { password } = _a, userData = tslib_1.__rest(_a, ["password"]);
            return userData;
        });
        res.status(200).json(usersWithoutPassword);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving users"
        });
    }
});
exports.getAllUserData = getAllUserData;
// get a user data
const getUserData = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userId;
    try {
        const user = yield user_1.default.findOne({ where: { id } });
        if (!user) {
            res.status(401).json({ message: "No such user found" });
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _a = user.toJSON(), { password } = _a, userData = tslib_1.__rest(_a, ["password"]);
        res.status(200).json(userData);
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error retrieving user"
        });
    }
});
exports.getUserData = getUserData;
// Update a user's data
const updateUser = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (req.file) {
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path);
            req.body.imageUrl = cloudinaryResponse.secure_url;
        }
        const updatedUserData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        if (req.body.address && req.body.addressID) {
            let shipAddress = [];
            const currentShipAddress = typeof user.shipAddress === "string"
                ? JSON.parse(user.shipAddress || "[]")
                : (user.shipAddress || []);
            shipAddress = Array.isArray(currentShipAddress) ? currentShipAddress : [];
            const addressIndex = shipAddress.findIndex(addr => addr.id === req.body.addressID);
            if (addressIndex !== -1) {
                shipAddress[addressIndex].address = req.body.address;
                updatedUserData.shipAddress = shipAddress;
            }
        }
        if (updatedUserData.password) {
            updatedUserData.password = (0, bcryptjs_1.hashSync)(updatedUserData.password, 10);
        }
        yield user_1.default.update(updatedUserData, { where: { id: userId } });
        const updatedUser = yield user_1.default.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });
        res.status(200).json({
            message: "Profile updated successfully",
            userData: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
// delete a user
const deleteUser = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const existingUser = yield user_1.default.findOne({ where: { id: userId } });
        if (!existingUser) {
            res.status(404).json({ message: "No such user found" });
            return;
        }
        yield user_1.default.destroy({ where: { id: userId } });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting user"
        });
    }
});
exports.deleteUser = deleteUser;
// update password
const updatePassword = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
        const userData = yield user_1.default.findOne({ where: { id: userId } });
        if (!userData) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (oldPassword) {
            const verifyPassword = yield (0, bcryptjs_1.compare)(oldPassword, userData.password);
            if (!verifyPassword) {
                res.status(403).json({
                    message: "Current Password is incorrect. Please enter the correct current password",
                });
                return;
            }
        }
        const hashedPassword = (0, bcryptjs_1.hashSync)(password, 10);
        userData.password = hashedPassword;
        userData.updatedAt = new Date();
        yield user_1.default.update(userData, { where: { id: userId } });
        res.status(200).json({ message: "Password successfully updated" });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePassword = updatePassword;
const updateShipAddress = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        yield user_1.default.update({
            shipAddress: req.body,
            updatedAt: new Date()
        }, { where: { id: userId } });
        const userData = yield user_1.default.findOne({ where: { id: userId } });
        res.status(200).json({
            message: "Shipping address updated successfully",
            data: userData,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateShipAddress = updateShipAddress;
const addExpoPushNotificationToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { expoPushToken } = req.body;
    try {
        yield user_1.default.update({
            expoPushToken,
            updatedAt: new Date()
        }, { where: { id: userId } });
        res.status(200).json({ message: "Push token saved successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.addExpoPushNotificationToken = addExpoPushNotificationToken;
