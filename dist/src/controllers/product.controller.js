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
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Configure cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Get all products
const allProducts = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.default.findAndCountAll({
            include: [
                {
                    model: user_1.default,
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                    include: [{ model: role_1.default }],
                },
            ],
        });
        if (!products) {
            throw new customErrors_1.default("No products found", 404);
        }
        res.status(200).json({ products });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting products"
        });
    }
});
exports.allProducts = allProducts;
// Get a product by ID
const getProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundProduct = yield product_1.default.findOne({
            where: { id: req.params.productId },
            include: [
                {
                    model: user_1.default,
                    attributes: [
                        "id",
                        "firstName",
                        "lastName",
                        "country",
                        "imageUrl",
                        "verifiedUser",
                    ],
                },
                {
                    model: buyerreview_1.default,
                    attributes: ["id", "comment", "rating", "createdAt"],
                    required: false,
                    include: [
                        {
                            model: user_1.default,
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "country",
                                "imageUrl",
                                "verifiedUser",
                            ],
                        },
                    ],
                },
            ],
        });
        if (!foundProduct) {
            throw new customErrors_1.default("Product not found", 404);
        }
        res.status(200).json({ product: foundProduct });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting product"
        });
    }
});
exports.getProduct = getProduct;
// Get all products of a user
const userProducts = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const userProducts = yield product_1.default.findAndCountAll({
            where: { userId: req.params.userId },
        });
        if (!userProducts) {
            throw new customErrors_1.default("No products found for this user", 404);
        }
        res.status(200).json({ products: userProducts });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error getting user products"
        });
    }
});
exports.userProducts = userProducts;
// Create a new product
const createProduct = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userData || typeof req.userData === 'string') {
            throw new customErrors_1.default("Invalid authentication token", 401);
        }
        const { productName, description, price, quantity, category } = req.body;
        // Validate required fields
        if (!productName || !description || !price || !quantity || !category) {
            throw new customErrors_1.default("Missing required fields", 400);
        }
        const productData = Object.assign(Object.assign({}, req.body), { userId: req.userData.UserId, createdAt: new Date(), updatedAt: new Date() });
        if (req.file) {
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path, { resource_type: "image" });
            productData.imageUrl = cloudinaryResponse.secure_url;
            // Remove the file from public directory
            fs.unlinkSync(req.file.path);
        }
        const result = yield product_1.default.create(productData);
        res.status(201).json({
            message: "Product created successfully",
            product: result,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
});
exports.createProduct = createProduct;
// Update a product
const updateProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.default.findByPk(req.params.productId);
        if (!product) {
            throw new customErrors_1.default("Product not found", 404);
        }
        if (req.file) {
            const cloudinaryResponse = yield cloudinary_1.v2.uploader.upload(req.file.path);
            req.body.imageUrl = cloudinaryResponse.secure_url;
            // Remove the file from public directory
            fs.unlinkSync(req.file.path);
        }
        const productData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date() });
        const [updatedCount] = yield product_1.default.update(productData, { where: { id: req.params.productId } });
        if (updatedCount === 0) {
            throw new customErrors_1.default("Failed to update product", 500);
        }
        res.status(200).json({ message: "Product updated successfully" });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error updating product"
        });
    }
});
exports.updateProduct = updateProduct;
// Delete a product
const removeProduct = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.default.findByPk(req.params.productId);
        if (!product) {
            throw new customErrors_1.default("Product not found", 404);
        }
        const deletedCount = yield product_1.default.destroy({
            where: { id: req.params.productId }
        });
        if (deletedCount === 0) {
            throw new customErrors_1.default("Failed to delete product", 500);
        }
        res.status(200).json({ message: "Product has been deleted successfully" });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error deleting product"
        });
    }
});
exports.removeProduct = removeProduct;
