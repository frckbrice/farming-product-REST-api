/**
 * UserOTPCode model — table kept for DB schema.
 * OTP authentication is disabled; we are keeping authentication simple.
 */
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
} from "sequelize-typescript";
import { UserOTPAttributes } from "../types";
import User from "./user";
@Table({
  timestamps: true,
  tableName: "userOTPCodes",
  modelName: "UserOTPCode",
})
class UserOTPCode extends Model<UserOTPAttributes> {
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
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: string;
  @Column({
    type: DataType.STRING,
  })
  declare otp: string;
  @Column({
    type: DataType.BIGINT,
  })
  declare expiredAt: number;
  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default UserOTPCode;
