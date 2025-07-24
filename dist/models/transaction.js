'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const order_1 = tslib_1.__importDefault(require("./order"));
let Transaction = class Transaction extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    tslib_1.__metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'completed', 'rejected'),
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "status", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('Payment', 'Refund'),
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "txType", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('MOBILE-MONEY', 'ORANGE-MONEY', 'VISA', 'MASTERCARD'),
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "txMethod", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSON,
    }),
    tslib_1.__metadata("design:type", Object)
], Transaction.prototype, "txDetails", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID
    }),
    tslib_1.__metadata("design:type", String)
], Transaction.prototype, "orderId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_1.default),
    tslib_1.__metadata("design:type", order_1.default)
], Transaction.prototype, "order", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Object)
], Transaction.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Object)
], Transaction.prototype, "updatedAt", void 0);
Transaction = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Transactions",
        modelName: "Transaction",
    })
], Transaction);
// export class Transaction extends Model {
//   declare id: string; // UUID
//   declare amount?: number;
//   declare status: 'pending' | 'completed' | 'rejected';
//   declare txType: 'Payment' | 'Refund';
//   declare txMethod?: 'MOBILE-MONEY' | 'ORANGE-MONEY' | 'VISA' | 'MASTERCARD';
//   declare txDetails?: object | null;
//   declare currency: string;
//   declare orderId: string; // UUID
//   declare createdAt: any;
//   declare updatedAt: any
//   // assosiation 
//   public static associations: { Order: Association<Transaction, Order>; };
//   static assosiate(models: {Transaction: typeof Transaction; Order: typeof Order}){
//     // Define associations here
//     Transaction.belongsTo(models.Order, { foreignKey: 'orderId', constraints: false });
//   }
// }
// // initilizing the model
// export const initTransactionModel =(sequelize: Sequelize): typeof Transaction =>{
//   Transaction.init(
//     {
//       id: {
//         allowNull: false,
//         primaryKey: true,
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//       },
//       amount: DataTypes.FLOAT,
//       status: {
//         type: DataTypes.ENUM('pending', 'completed', 'rejected'),
//         defaultValue: 'pending',
//       },
//       txType: {
//         type: DataTypes.ENUM('Payment', 'Refund'),
//         defaultValue: 'Payment',
//       },
//       txMethod: {
//         type: DataTypes.ENUM('MOBILE-MONEY', 'ORANGE-MONEY', 'VISA', 'MASTERCARD'),
//       },
//       txDetails: {
//         type: DataTypes.JSON,
//       },
//       currency: {
//         type: DataTypes.STRING,
//         defaultValue: 'XAF',
//       },
//       orderId: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: 'Order',
//           key: 'id',
//         },
//       },
//     },
//     {
//       sequelize,
//       modelName: 'Transaction',
//     }
//   );
//   return Transaction;
// }
exports.default = Transaction;
