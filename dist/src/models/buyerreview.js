"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const product_1 = tslib_1.__importDefault(require("./product"));
const user_1 = tslib_1.__importDefault(require("./user"));
const order_1 = tslib_1.__importDefault(require("./order"));
let BuyerReview = class BuyerReview extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "comment", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    tslib_1.__metadata("design:type", Number)
], BuyerReview.prototype, "rating", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "prodId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "orderId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_1.default),
    tslib_1.__metadata("design:type", user_1.default)
], BuyerReview.prototype, "user", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => product_1.default),
    tslib_1.__metadata("design:type", product_1.default)
], BuyerReview.prototype, "product", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_1.default),
    tslib_1.__metadata("design:type", order_1.default)
], BuyerReview.prototype, "order", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], BuyerReview.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Date)
], BuyerReview.prototype, "updatedAt", void 0);
BuyerReview = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "BuyerReviews",
        modelName: "BuyerReview",
    })
], BuyerReview);
exports.default = BuyerReview;
