import { v2 as cloudinary } from "cloudinary";
import * as fs from "fs";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth-check";
import { AppError } from "../errors";
import * as orderService from "../services/order.service";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getOrderById = async (
  req: Request<{ orderId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const orderData = await orderService.getOrderById(req.params.orderId);
    res.status(200).json({ status: "success", order: orderData });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const getBuyerOrders = async (
  req: Request<{ buyerId: string }, unknown, unknown, { orderStatus?: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const buyerOrders = await orderService.getBuyerOrders(
      req.params.buyerId,
      req.query.orderStatus,
    );
    res.status(200).json({ status: "success", ordersData: buyerOrders });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const getSellerOrders = async (
  req: Request<
    { sellerId: string },
    unknown,
    unknown,
    { orderStatus?: string; productName?: string }
  >,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const sellerOrders = await orderService.getSellerOrders(
      req.params.sellerId,
      req.query.orderStatus,
      req.query.productName,
    );
    res.status(200).json({ status: "success", ordersData: sellerOrders });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const createOrder = async (
  req: Request<{ productId: string }, unknown, orderService.CreateOrderInput>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const buyerId =
      (req as AuthenticatedRequest).userData?.UserId ??
      "3ff1ceec-9f0d-4952-9c6c-fe3973dd8fa1";
    const result = await orderService.createOrder(
      req.params.productId,
      req.body,
      buyerId,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const updateOrder = async (
  req: Request<{ orderId: string }, unknown, orderService.UpdateOrderInput>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const result = await orderService.updateOrder(
      req.params.orderId,
      req.body.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const getTransaction = async (
  req: Request<{ orderId: string }>,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const transaction = await orderService.getTransactionByOrderId(
      req.params.orderId,
    );
    res.status(200).json({
      message: "Transaction Details",
      details: transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const updateDispatchDetails = async (
  req: Request<{ orderId: string }, unknown, orderService.DispatchDetailsInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { method, date } = req.body;
    let imageUrl: string | undefined;
    if (req.file?.path) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      imageUrl = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }
    const result = await orderService.updateDispatchDetails(orderId, {
      method,
      date,
      imageUrl,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
