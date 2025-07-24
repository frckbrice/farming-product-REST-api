"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductSearch = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const sequelize_1 = require("sequelize");
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Get all products with search and filters
const getAllProductSearch = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productName, productCat = "All", minPrice, maxPrice, productRating, wholeSale, page = "1", limit = "10" } = req.query;
        // Validate pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        if (isNaN(pageNum) || pageNum < 1) {
            throw new customErrors_1.default("Invalid page number", 400);
        }
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new customErrors_1.default("Invalid limit value. Must be between 1 and 100", 400);
        }
        const offset = (pageNum - 1) * limitNum;
        const whereClause = {};
        // Build where clause based on query parameters
        if (productName === null || productName === void 0 ? void 0 : productName.trim()) {
            whereClause.productName = {
                [sequelize_1.Op.like]: `%${productName}%`,
            };
        }
        if (productCat && productCat !== "All") {
            whereClause.productCat = {
                [sequelize_1.Op.like]: `%${productCat}%`
            };
        }
        // Validate and add price range
        const priceMin = minPrice ? parseInt(minPrice) : undefined;
        const priceMax = maxPrice ? parseInt(maxPrice) : undefined;
        if (priceMin !== undefined && priceMax !== undefined) {
            if (isNaN(priceMin) || isNaN(priceMax)) {
                throw new customErrors_1.default("Invalid price range values", 400);
            }
            if (priceMin > priceMax) {
                throw new customErrors_1.default("Minimum price cannot be greater than maximum price", 400);
            }
            whereClause.price = {
                [sequelize_1.Op.between]: [priceMin, priceMax],
            };
        }
        if (wholeSale === "true") {
            whereClause.wholeSale = true;
        }
        // Validate rating
        const rating = productRating ? parseInt(productRating) : 5;
        if (isNaN(rating) || rating < 1 || rating > 5) {
            throw new customErrors_1.default("Invalid rating value. Must be between 1 and 5", 400);
        }
        const result = yield product_1.default.findAndCountAll({
            where: whereClause,
            limit: limitNum,
            offset,
            include: [
                {
                    model: user_1.default,
                    attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                },
                {
                    model: buyerreview_1.default,
                    attributes: ["id", "comment", "rating"],
                    where: {
                        rating,
                    },
                    include: [
                        {
                            model: user_1.default,
                            attributes: ["id", "firstName", "lastName", "country", "verifiedUser"],
                        },
                    ],
                    required: false,
                },
            ],
        });
        if (!result.count) {
            res.status(200).json({
                message: "No products found matching the search criteria",
                queryResult: result,
            });
            return;
        }
        res.status(200).json({
            queryResult: result,
        });
    }
    catch (error) {
        if (error instanceof customErrors_1.default) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error searching products"
        });
    }
});
exports.getAllProductSearch = getAllProductSearch;
