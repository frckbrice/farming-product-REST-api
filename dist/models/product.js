'use strict';
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
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
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
        type: sequelize_typescript_1.DataType.UUID
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
    tslib_1.__metadata("design:type", Object)
], Product.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Object)
], Product.prototype, "updatedAt", void 0);
Product = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Products",
        modelName: "Product",
    })
], Product);
// export class Product extends Model {
//   declare id: string; // UUID
//   declare productName?: string;
//   declare productCat?: string;
//   declare priceType?: string;
//   declare price?: number;
//   declare imageUrl?: string;
//   declare description?: string;
//   declare wholeSale?: boolean;
//   declare userId: string; // UUID
//   declare createdAt: any;
//   declare updatedAt: any
//     // Associations
//     public static associations: {
//       user: Association<Product, User>;
//       order: Association<Product, Order>;
//       buyerReview: Association<Product, BuyerReview>;
//     };
//     static associate(models: {  User: typeof User; Order: typeof Order; buyerReview: typeof BuyerReview }) {
//       Product.belongsTo(models.User, { foreignKey: 'userId', constraints: false });
//       Product.hasMany(models.buyerReview, { foreignKey: 'prodId', constraints: false });
//       Product.hasMany(models.Order, { foreignKey: 'prodId', constraints: false });
//     }
// }
// // initializing model
// export const initProductModel = (sequelize: Sequelize): typeof Product =>{
//   Product.init(
//     {
//       id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         allowNull: false,
//         primaryKey: true,
//       },
//       productName: DataTypes.STRING,
//       productCat: DataTypes.STRING,
//       priceType: DataTypes.STRING,
//       price: DataTypes.INTEGER,
//       imageUrl: DataTypes.STRING,
//       description: DataTypes.STRING,
//       wholeSale: DataTypes.BOOLEAN,
//       userId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: 'User',
//           key: 'id',
//         },
//       },
//     },
//     {
//       sequelize,
//       modelName: 'Product',
//     }
//   );
// return Product;
// }
exports.default = Product;
