"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProduct = exports.updateProduct = exports.createProduct = exports.userProducts = exports.getProduct = exports.allProducts = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
const role_1 = tslib_1.__importDefault(require("../models/role"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// get all products
const allProducts = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let products = yield product_1.default.findAndCountAll({
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser'],
                    include: [
                        {
                            model: role_1.default
                        }
                    ]
                }
            ]
        });
        res.status(200).json({ products: products });
    }
    catch (err) {
        res.status(500).json({ message: 'Error getting products' });
    }
});
exports.allProducts = allProducts;
// get a product with a product ID
const getProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let productId = req.params.productId;
    try {
        let foundProduct = yield product_1.default.findOne({
            where: { id: productId }, include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'imageUrl', 'verifiedUser']
                },
                {
                    model: buyerreview_1.default,
                    attributes: ['id', 'comment', 'rating', 'createdAt'],
                    required: false,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['id', 'firstName', 'lastName', 'country', 'imageUrl', 'verifiedUser']
                        }
                    ]
                }
            ]
        });
        res.status(200).json({ product: foundProduct });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getProduct = getProduct;
// get all product of a User
const userProducts = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const userProducts = yield product_1.default.findAndCountAll({
            where: { userId: userId },
            //  order:[['createdAt', 'DESC']]
        });
        // console.log(userProducts)
        res.status(200).json({ products: userProducts });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.userProducts = userProducts;
// add a new product
const createProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const productData = Object.assign(Object.assign({}, req.body), { userId: req.userData.UserId });
        if (req.file) {
            const cloudinary_image_uplaod = yield cloudinary_1.v2.uploader.upload(req.file.path, { resource_type: 'image' });
            productData.imageUrl = cloudinary_image_uplaod.secure_url;
            // removing the file from public directory
            fs.unlinkSync(req.file.path);
        }
        const result = yield product_1.default.create(productData);
        res.status(200).json({
            message: 'OK',
            product: result
        });
    }
    catch (err) {
        // res.status(500).json({message: err})
        console.log(`\n\n Error: ${err}`);
        next(err);
    }
});
exports.createProduct = createProduct;
// update a prodcut
const updateProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let productId = req.params.productId;
    try {
        if (req.file) {
            // req.body.imageUrl = req.file.path;
            // upload image to the cloudinary
            let cloudinary_image_uplaod = yield cloudinary_1.v2.uploader.upload(req.file.path);
            // saving the imagine url of the cloudinary to our db
            req.body.imageUrl = cloudinary_image_uplaod.secure_url;
        }
        let productData = req.body;
        yield product_1.default.update(productData, { where: { id: productId } });
        res.status(200).json({ message: 'Updated Successfully' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.updateProduct = updateProduct;
// delete a product
const removeProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield product_1.default.destroy({ where: { id: req.params.productId } });
        res.status(200).json({ message: "Your product has been deleted from the system" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.removeProduct = removeProduct;
