"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductSearch = void 0;
const tslib_1 = require("tslib");
const errors_1 = require("../errors");
const productSearchService = tslib_1.__importStar(require("../services/product.search.service"));
const getAllProductSearch = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const result = yield productSearchService.searchProducts(query);
        if (!result.count) {
            res.status(200).json({
                message: "No products found matching the search criteria",
                queryResult: result,
            });
            return;
        }
        res.status(200).json({ queryResult: result });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error searching products",
        });
    }
});
exports.getAllProductSearch = getAllProductSearch;
