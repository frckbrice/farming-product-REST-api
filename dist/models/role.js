'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = tslib_1.__importDefault(require("./user"));
let Role = class Role extends sequelize_typescript_1.Model {
};
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        allowNull: false,
    }),
    tslib_1.__metadata("design:type", String)
], Role.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    tslib_1.__metadata("design:type", String)
], Role.prototype, "roleName", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => user_1.default, 'roleId'),
    tslib_1.__metadata("design:type", Array)
], Role.prototype, "user", void 0);
Role = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "Roles",
        modelName: "Role",
    })
], Role);
// export class Role extends Model {
//   declare id: string;
//   declare roleName: 'farmer' | 'buyer';
//   // Associations
//   public static associations: {
//     user: Association<Role, User>;
//   };
//   static associate(models: {  User: typeof User; Role: typeof Role }) {
//     Role.hasMany(models.User, { foreignKey: 'roleId' })
//   }
// }
// // intilize the model
// export const initRoleModel =(sequelize: Sequelize): typeof Role =>{
//   Role.init(
//     {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: DataTypes.INTEGER,
//       },
//       roleName: {
//         type: DataTypes.ENUM('farmer', 'buyer'),
//       },
//     },
//     {
//       sequelize,
//       modelName: 'Role',
//     }
//   );
// return Role;
// }
exports.default = Role;
