'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = tslib_1.__importDefault(require("./user"));
const buyerreview_1 = tslib_1.__importDefault(require("./buyerreview"));
const product_1 = tslib_1.__importDefault(require("./product"));
const transaction_1 = tslib_1.__importDefault(require("./transaction"));
let Order = class Order extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    tslib_1.__metadata("design:type", Number)
], Order.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "shipAddress", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "weight", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
    }),
    tslib_1.__metadata("design:type", Object)
], Order.prototype, "review", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'processing', 'delivered', 'dispatched'),
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "status", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "prodId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "buyerId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    tslib_1.__metadata("design:type", String)
], Order.prototype, "sellerId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
    }),
    tslib_1.__metadata("design:type", Object)
], Order.prototype, "dispatchDetails", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
    }),
    tslib_1.__metadata("design:type", Boolean)
], Order.prototype, "dispatched", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
    }),
    tslib_1.__metadata("design:type", Object)
], Order.prototype, "deliveryDate", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasOne)(() => buyerreview_1.default),
    tslib_1.__metadata("design:type", buyerreview_1.default)
], Order.prototype, "buyerReview", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasOne)(() => transaction_1.default),
    tslib_1.__metadata("design:type", transaction_1.default)
], Order.prototype, "transaction", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_1.default, 'buyerId'),
    tslib_1.__metadata("design:type", user_1.default)
], Order.prototype, "buyer", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_1.default, 'sellerId'),
    tslib_1.__metadata("design:type", user_1.default)
], Order.prototype, "seller", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => product_1.default, 'prodId'),
    tslib_1.__metadata("design:type", product_1.default)
], Order.prototype, "product", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Object)
], Order.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Object)
], Order.prototype, "updatedAt", void 0);
Order = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Orders",
        modelName: "Order",
    })
], Order);
exports.default = Order;
