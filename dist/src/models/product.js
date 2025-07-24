"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = tslib_1.__importDefault(require("./user"));
const buyerreview_1 = tslib_1.__importDefault(require("./buyerreview"));
const order_1 = tslib_1.__importDefault(require("./order"));
let Product = class Product extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "productName", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "productCat", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "priceType", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
    }),
    tslib_1.__metadata("design:type", Number)
], Product.prototype, "price", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "imageUrl", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Product.prototype, "wholeSale", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    tslib_1.__metadata("design:type", String)
], Product.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_1.default),
    tslib_1.__metadata("design:type", user_1.default)
], Product.prototype, "user", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => buyerreview_1.default),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "buyerReview", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => order_1.default),
    tslib_1.__metadata("design:type", Array)
], Product.prototype, "order", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
Product = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Products",
        modelName: "Product",
    })
], Product);
exports.default = Product;
