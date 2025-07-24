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
  HasMany,
} from "sequelize-typescript";
import { ProductAttributes } from "../types";

import User from "./user";
import BuyerReview from "./buyerreview";
import Order from "./order";

@Table({
  timestamps: true,
  tableName: "Products",
  modelName: "Product",
})
class Product extends Model<ProductAttributes> {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  declare id: string; // UUID

  @Column({
    type: DataType.STRING,
  })
  declare productName?: string;

  @Column({
    type: DataType.STRING,
  })
  declare productCat?: string;

  @Column({
    type: DataType.STRING,
  })
  declare priceType?: string;

  @Column({
    type: DataType.FLOAT,
  })
  declare price?: number;

  @Column({
    type: DataType.STRING,
  })
  declare imageUrl?: string;

  @Column({
    type: DataType.STRING,
  })
  declare description?: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare wholeSale?: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: string; // UUID

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => BuyerReview)
  buyerReview?: BuyerReview[];

  @HasMany(() => Order)
  order?: Order[];

  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default Product;
