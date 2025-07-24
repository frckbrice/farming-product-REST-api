import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { RoleAttributes } from "../types";
import User from "./user";

@Table({
  timestamps: true,
  tableName: "Roles",
  modelName: "Role",
})
class Role extends Model<RoleAttributes> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
  })
  declare roleName: "farmer" | "buyer";

  @HasMany(() => User, "roleId")
  user?: User[];
}

export default Role;
