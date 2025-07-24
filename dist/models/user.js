"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const role_1 = tslib_1.__importDefault(require("./role"));
const order_1 = tslib_1.__importDefault(require("./order"));
const buyerreview_1 = tslib_1.__importDefault(require("./buyerreview"));
const product_1 = tslib_1.__importDefault(require("./product"));
// Ensure this is the correct path to your Role model
// import { Product } from "./product"; // Ensure this is the correct path to your Product model
// import { Notification } from "./notifiation"; // Ensure this is the correct path to your Notification model
// import { BuyerReview } from "./buyerreview"; // Ensure this is the correct path to your BuyerReview model
// import { Order } from "./order"; // Ensure this is the correct path to your Order model
let User = class User extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "address", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
        defaultValue: []
    }),
    tslib_1.__metadata("design:type", Object)
], User.prototype, "shipAddress", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "country", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "imageUrl", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "googleId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "facebookId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BIGINT
    }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "phoneNum", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", Object)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING
    }),
    tslib_1.__metadata("design:type", Object)
], User.prototype, "expoPushToken", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN
    }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "vip", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN
    }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "verifiedUser", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => role_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "roleId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => role_1.default),
    tslib_1.__metadata("design:type", role_1.default)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => order_1.default, 'buyerId'),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "ordersAsBuyer", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => order_1.default, 'sellerId'),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "ordersAsSeller", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => product_1.default, 'userId'),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "product", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => buyerreview_1.default, 'userId'),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "buyerReviews", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Object)
], User.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Object)
], User.prototype, "updatedAt", void 0);
User = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Users",
        modelName: "User",
    })
], User);
exports.default = User;
