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
        type: sequelize_typescript_1.DataType.UUID
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => product_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID
    }),
    tslib_1.__metadata("design:type", String)
], BuyerReview.prototype, "prodId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID
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
    tslib_1.__metadata("design:type", Object)
], BuyerReview.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Object)
], BuyerReview.prototype, "updatedAt", void 0);
BuyerReview = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "BuyerReviews",
        modelName: "BuyerReview",
    })
], BuyerReview);
// export class BuyerReview extends Model {
//   declare id: string;
//   declare comment: string;
//   declare rating: number;
//   declare userId: string;
//   declare prodId: string;
//   declare orderId: string;
//   declare createdAt: any;
//   declare updatedAt: any
//   // Associations
//   public static associations: {
//     product: Association<BuyerReview, Product>;
//     user: Association<BuyerReview, User>;
//     order: Association<BuyerReview, Order>;
//   };
//   static associate(models: { Product: typeof Product; User: typeof User; Order: typeof Order }) {
//     BuyerReview.belongsTo(models.Product, { foreignKey: "prodId", constraints: false });
//     BuyerReview.belongsTo(models.User, { foreignKey: "userId", constraints: false });
//     BuyerReview.belongsTo(models.Order, { foreignKey: "orderId", constraints: false });
//   }
// }
// // Initialize the model
// export const initBuyerReviewModel = (sequelize: Sequelize): typeof BuyerReview => {
//   BuyerReview.init(
//     {
//       id: {
//         allowNull: false,
//         primaryKey: true,
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//       },
//       comment: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       rating: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       userId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: "User",
//           key: "id",
//         },
//       },
//       prodId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: "Product",
//           key: "id",
//         },
//       },
//       orderId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: "Order",
//           key: "id",
//         },
//       },
//     },
//     {
//       sequelize,
//       modelName: "BuyerReview",
//       tableName: "BuyerReviews", // Ensure this matches your actual table name
//     }
//   );
//   return BuyerReview;
// };
exports.default = BuyerReview;
