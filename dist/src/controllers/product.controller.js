"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProduct = exports.updateProduct = exports.createProduct = exports.userProducts = exports.getProduct = exports.allProducts = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const cloudinary_1 = require("cloudinary");
const errors_1 = require("../errors");
const productService = tslib_1.__importStar(require("../services/product.service"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const allProducts = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productService.findAllProducts();
        res.status(200).json({ products });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting products",
        });
    }
});
exports.allProducts = allProducts;
const getProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundProduct = yield productService.findProductById(req.params.productId);
        res.status(200).json({ product: foundProduct });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting product",
        });
    }
});
exports.getProduct = getProduct;
const userProducts = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userProducts = yield productService.findProductsByUserId(req.params.userId);
        res.status(200).json({ products: userProducts });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting user products",
        });
    }
});
exports.userProducts = userProducts;
const createProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.userData || typeof req.userData === "string") {
            throw new errors_1.AppError("Invalid authentication token", 401);
        }
        const body = Object.assign({}, req.body);
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path, { resource_type: "image" });
            body.imageUrl = cloudinaryResponse.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const result = yield productService.createProduct(req.userData.UserId, body);
        res.status(201).json({
            message: "Product created successfully",
            product: result,
        });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = Object.assign({}, req.body);
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path);
            body.imageUrl = cloudinaryResponse.secure_url;
            fs.unlinkSync(req.file.path);
        }
        yield productService.updateProduct(req.params.productId, body);
        res.status(200).json({ message: "Product updated successfully" });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error updating product",
        });
    }
});
exports.updateProduct = updateProduct;
const removeProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield productService.removeProduct(req.params.productId);
        res.status(200).json({
            message: "Product has been deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting product",
        });
    }
});
exports.removeProduct = removeProduct;
