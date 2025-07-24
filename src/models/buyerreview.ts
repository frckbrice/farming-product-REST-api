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
import { BuyerReviewAttributes } from "../types";
import Product from "./product";
import User from "./user";
import Order from "./order";

@Table({
  timestamps: true,
  tableName: "BuyerReviews",
  modelName: "BuyerReview",
})
class BuyerReview extends Model<BuyerReviewAttributes> {
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
  declare comment: string;
  @Column({
    type: DataType.INTEGER,
  })
  declare rating: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
  })
  prodId!: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
  })
  orderId!: string;

  @BelongsTo(() => User)
  user?: User;

  @BelongsTo(() => Product)
  product?: Product;

  @BelongsTo(() => Order)
  order?: Order;

  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default BuyerReview;
