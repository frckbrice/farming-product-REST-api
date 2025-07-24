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
// get a user data
const getAllUserData = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let users = yield user_1.default.findAll({});
        if (!(users === null || users === void 0 ? void 0 : users.length)) {
            return res.status(400).json({ message: "No users found" });
        }
        // remove password field from output
        const userWithOutPasswaord = users.map((user) => {
            user.password = '';
            return user;
        });
        res.status(200).json(userWithOutPasswaord);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getAllUserData = getAllUserData;
// get a user data
const getUserData = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    // var id = req.userData.UserId;
    const id = req.params.userId;
    try {
        let user = yield user_1.default.findOne({ where: { id: id } });
        if (!user) {
            return res.status(401).json({ message: "No such user found" });
        }
        // remove password field from output
        user.password = '';
        user = user.toJSON();
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getUserData = getUserData;
// update a user data
// export const updateUser = async (req: any, res: Response, next: any) => {
//   req.file = { /** used for testing  uploadMiddleware('profileImage'),*/
//     path: "https://randomuser.me/api/portraits/men/1.jpg",
//     originalname: 'profile.jpg',
//     mimetype: 'image/jpeg',
//     size: 12345
//   };
//   try {
//     let userId = req.params.userId
//     // check if the user exists
//     let user = await User.findOne({ where: { id: userId } })
//     if (!user) {
//       return res.status(404).json({ message: "No such user found" });
//     }
//     // upload file to buket storage
//     if (req.file) {
//       let cloudinary_image_uplaod = await cloudinary.uploader.upload(req.file.path)
//       // saving the imagine url of the cloudinary to our db
//       req.body.imageUrl = cloudinary_image_uplaod.secure_url;
//     }
//     if (req.body.address) {
//       // updating ship address array as well
//       let updateShipAddress = JSON.parse(user?.shipAddress)
//       const index: number = updateShipAddress.findIndex((obj: any) => obj.id === req.body.addressID);
//       if (index !== -1) {
//         updateShipAddress[index]['address'] = req.body.address;
//       }
//       if (user) {
//         user.shipAddress = updateShipAddress
//       }
//       await user?.save()
//     }
//     let updatedUserData = req.body
//     updatedUserData.updatedAt = Date.now()
//     // check first whether the previous password match with entered previous password
//     updatedUserData.password && (updatedUserData.password = hashSync(updatedUserData.password, 10))
//     // password chanegs===> logged out the user and ask to logged in again
//     await User.update(updatedUserData, { where: { id: userId } })
//     const response = await User.findOne({ where: { id: userId } })
//     res.status(200).json({ message: 'Profile has been successfully updated', userData: response })
//   }
//   catch (err) {
//     // res.status(500).json({message: err.message})
//     next(err)
//   }
// }
// Update a user's data
const updateUser = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    // req.file = { // Mock file for testing (remove in production)
    //   path: "https://randomuser.me/api/portraits/men/1.jpg",
    //   originalname: 'profile.jpg',
    //   mimetype: 'image/jpeg',
    //   size: 12345
    // };
    try {
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (req.file) {
            const cloudinaryUpload = yield cloudinary_1.v2.uploader.upload(req.file.path);
            req.body.imageUrl = cloudinaryUpload.secure_url;
        }
        const updatedUserData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        if (req.body.address && req.body.addressID) {
            let shipAddress = [];
            if (typeof (user === null || user === void 0 ? void 0 : user.shipAddress) === 'string') {
                updatedUserData.shipAddress = JSON.parse(user.shipAddress || '[]');
            }
            else {
                shipAddress = user === null || user === void 0 ? void 0 : user.shipAddress;
            }
            const addressIndex = Array.isArray(shipAddress) && (shipAddress === null || shipAddress === void 0 ? void 0 : shipAddress.findIndex((addr) => addr.id === req.body.addressID));
            if (addressIndex !== -1) {
                shipAddress[addressIndex].address = req.body.address;
                updatedUserData.shipAddress = JSON.stringify(shipAddress);
            }
        }
        if (updatedUserData.password) {
            updatedUserData.password = (0, bcryptjs_1.hashSync)(updatedUserData.password, 10);
        }
        yield user_1.default.update(updatedUserData, { where: { id: userId } });
        const updatedUser = yield user_1.default.findByPk(userId, { attributes: { exclude: ['password'] } });
        return res.status(200).json({
            message: 'Profile updated successfully',
            userData: updatedUser,
        });
    }
    catch (err) {
        console.error('Error updating user:', err);
        next(err);
    }
});
exports.updateUser = updateUser;
// delete a user
const deleteUser = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.params.userId;
        // parseInt(userId) != req.userData.UserId && res.status(404).json({message: "You are not authorized for this, please log in into using your id"}) 
        // check first if the user exists
        const existingUser = yield user_1.default.findOne({ where: { id: userId } });
        if (!existingUser) {
            return res.status(404).json({ message: "No such user found" });
        }
        yield user_1.default.destroy({ where: { id: userId } });
        res.status(200).send('user deleted');
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.deleteUser = deleteUser;
// update password
const updatePassword = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { password, userId, oldPassword } = req.body;
    if (password === "") {
        return res.status(400).json({
            status: "FAILED",
            massage: "Empty input fields",
        });
    }
    if (password.length < 8) {
        return res.status(400).json({
            status: "FAILED",
            massage: "Password must be at least 8 characters ",
        });
    }
    try {
        let userData = yield user_1.default.findOne({ where: { id: userId } });
        if (oldPassword) {
            let verifyPassword = yield (0, bcryptjs_1.compare)(oldPassword, userData === null || userData === void 0 ? void 0 : userData.password);
            if (!verifyPassword) {
                return res.status(403).json({ message: 'Current Password is Incorrect. Please enter the correct current password' });
            }
        }
        let hashedPassword = (0, bcryptjs_1.hashSync)(password, 10);
        if (userData) {
            userData.password = hashedPassword;
            userData.updatedAt = Date.now();
            yield user_1.default.update(userData, { where: { id: userId } });
            res.status(200).json({ message: 'Password successfully updated' });
        }
        else {
            res.status(204).json({ message: 'No Content Found or user not exist' });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.updatePassword = updatePassword;
const updateShipAddress = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const response = yield user_1.default.update({
            shipAddress: req.body
        }, { where: { id: userId } });
        let userData = yield user_1.default.findOne({ where: { id: userId } });
        res.status(200).json({
            message: "successfull",
            updateResponse: response,
            data: userData
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateShipAddress = updateShipAddress;
const addExpoPushNotificationToken = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { expoPushToken } = req.body;
    try {
        yield user_1.default.update({ expoPushToken }, { where: { id: userId } });
        res.status(200).json({ message: 'Push token saved successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.addExpoPushNotificationToken = addExpoPushNotificationToken;
