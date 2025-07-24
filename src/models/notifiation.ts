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
} from "sequelize-typescript";
import {
  NotificationAttributes,
  NotificationCreationAttributes,
} from "../types";
import User from "./user";

@Table({
  timestamps: true,
  tableName: "Notifications",
  modelName: "Notification",
})
class Notification extends Model<
  NotificationAttributes,
  NotificationCreationAttributes
> {
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
  declare title?: string;
  @Column({
    type: DataType.STRING,
  })
  declare message?: string;
  @Column({
    type: DataType.BOOLEAN,
  })
  declare isRead: boolean;
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: string; // UUID

  @BelongsTo(() => User)
  user!: User;

  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
}

export default Notification;
