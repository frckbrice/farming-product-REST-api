import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Order from "./order";
import { TransactionAttributes } from "../types";

@Table({
  timestamps: true,
  tableName: "Transactions",
  modelName: "Transaction",
})
class Transaction extends Model<TransactionAttributes> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string; // UUID
  @Column({
    type: DataType.INTEGER,
  })
  declare amount?: number;
  @Column({
    type: DataType.ENUM("pending", "completed", "rejected"),
  })
  declare status: string;
  @Column({
    type: DataType.ENUM("Payment", "Refund"),
  })
  declare txType: string;
  @Column({
    type: DataType.ENUM("MOBILE-MONEY", "ORANGE-MONEY", "VISA", "MASTERCARD"),
  })
  declare txMethod?: string;
  @Column({
    type: DataType.JSON,
  })
  declare txDetails?: object | null;
  @Column({
    type: DataType.STRING,
  })
  declare currency: string;
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
  })
  orderId!: string; // UUID

  @BelongsTo(() => Order)
  order!: Order;
  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default Transaction;
