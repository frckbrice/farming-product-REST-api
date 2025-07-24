"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductSearch = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const buyerreview_1 = tslib_1.__importDefault(require("../models/buyerreview"));
const product_1 = tslib_1.__importDefault(require("../models/product"));
const sequelize_1 = require("sequelize");
const getAllProductSearch = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const searchProductName = req.query.productName;
    const searchProductCat = req.query.productCat || "All";
    const searchProductPriceMin = parseInt(req.query.minPrice);
    const searchProductPriceMax = parseInt(req.query.maxPrice);
    const searchProductRating = parseInt(req.query.productRating) || 5;
    const wholeSale = req.query.wholeSale || false;
    console.log("\n\n inside search route: ", searchProductName, searchProductCat, searchProductPriceMin, searchProductPriceMax, searchProductRating, wholeSale);
    const { page = '1', limit = '10' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = {};
    // building where clause based on the req query
    // if(searchProductName && searchProductName.trim() !=='')
    if (searchProductName === null || searchProductName === void 0 ? void 0 : searchProductName.trim()) {
        whereClause.productName = {
            [sequelize_1.Op.like]: `%${searchProductName}%`
        };
    }
    if (searchProductCat && searchProductCat !== 'All') {
        whereClause.productCat = { [sequelize_1.Op.like]: `%${searchProductCat}%` };
    }
    if (!isNaN(searchProductPriceMin) &&
        !isNaN(searchProductPriceMax)) {
        whereClause.price = { [sequelize_1.Op.between]: [searchProductPriceMin, searchProductPriceMax] };
    }
    if (wholeSale) {
        whereClause.wholeSale = true;
    }
    try {
        let result = yield product_1.default.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            include: [
                {
                    model: user_1.default,
                    attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser'],
                    // include: [
                    //     {
                    //         model: models.Role
                    //     }
                    // ]
                },
                {
                    model: buyerreview_1.default,
                    attributes: ['id', 'comment', 'rating'],
                    where: {
                        rating: searchProductRating
                    },
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['id', 'firstName', 'lastName', 'country', 'verifiedUser'],
                            // include: [
                            //     {
                            //         model: models.Role
                            //     }
                            // ]
                        }
                    ],
                    required: false
                }
            ]
            // {
            //     productName:{
            //         [Op.iLike]: `%${searchProductName}%`
            //     },
            //     productCat: searchProductCat !== 'All' ? searchProductCat: {[Op.ne]:null}
            // }
        });
        res.status(200).json({
            queryResult: result
        });
    }
    catch (err) {
        console.log("\n\n Error: ", err);
        res.status(500).json({ message: err.message });
    }
});
exports.getAllProductSearch = getAllProductSearch;
