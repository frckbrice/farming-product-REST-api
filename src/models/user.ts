import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import { UserAttributes } from "../types";
import Role from "./role";
import Order from "./order";
import BuyerReview from "./buyerreview";
import Product from "./product";

@Table({
  timestamps: true,
  tableName: "Users",
  modelName: "User",
})
class User extends Model<UserAttributes> {
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
  declare firstName: string;
  @Column({
    type: DataType.STRING,
  })
  declare lastName: string;
  @Column({
    type: DataType.STRING,
  })
  declare email: string;
  @Column({
    type: DataType.STRING,
  })
  declare address: string;
  @Column({
    type: DataType.JSON,
    defaultValue: [],
  })
  declare shipAddress: object[];
  @Column({
    type: DataType.STRING,
  })
  declare country: string;
  @Column({
    type: DataType.STRING,
  })
  declare imageUrl: string;
  @Column({
    type: DataType.STRING,
  })
  declare googleId: string;
  @Column({
    type: DataType.STRING,
  })
  declare facebookId: string;
  @Column({
    type: DataType.BIGINT,
  })
  declare phoneNum: number;
  @Column({
    type: DataType.STRING,
  })
  declare password: string | null;
  @Column({
    type: DataType.STRING,
  })
  declare expoPushToken: string | null;

  @Column({
    type: DataType.BOOLEAN,
  })
  declare vip: boolean;
  @Column({
    type: DataType.BOOLEAN,
  })
  declare verifiedUser: boolean;
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
  })
  roleId!: string;

  @BelongsTo(() => Role)
  role!: Role;

  @HasMany(() => Order, "buyerId")
  ordersAsBuyer?: Order[];

  @HasMany(() => Order, "sellerId")
  ordersAsSeller?: Order[];

  @HasMany(() => Product, "userId")
  product?: Product[];

  @HasMany(() => BuyerReview, "userId")
  buyerReviews?: BuyerReview[];

  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default User;
