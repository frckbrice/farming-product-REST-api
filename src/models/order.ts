"use strict";
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";
import { OrderAttributes } from "../types";
import User from "./user";
import BuyerReview from "./buyerreview";
import Product from "./product";
import Transaction from "./transaction";

@Table({
  timestamps: true,
  tableName: "Orders",
  modelName: "Order",
})
class Order extends Model<OrderAttributes> {
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
    type: DataType.STRING,
  })
  declare shipAddress?: string;
  @Column({
    type: DataType.STRING,
  })
  declare weight?: string;
  @Column({
    type: DataType.JSON,
  })
  declare review?: object | null;
  @Column({
    type: DataType.ENUM("pending", "processing", "delivered", "dispatched"),
  })
  declare status: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
  })
  prodId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  buyerId!: string; // UUID

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  sellerId!: string; // UUID
  @Column({
    type: DataType.JSON,
  })
  declare dispatchDetails?: object | null;
  @Column({
    type: DataType.BOOLEAN,
  })
  declare dispatched: boolean;
  @Column({
    type: DataType.DATE,
  })
  declare deliveryDate?: Date | null;

  @HasOne(() => BuyerReview)
  buyerReview?: BuyerReview; // UUID
  @HasOne(() => Transaction)
  transaction?: Transaction;

  @BelongsTo(() => User, "buyerId")
  buyer!: User;

  @BelongsTo(() => User, "sellerId")
  seller!: User;

  @BelongsTo(() => Product, "prodId")
  product!: Product;

  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default Order;
