import { Request, Response } from "express";
import AppError from "../errors/customErrors";

interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
): void => {
  // Set default values
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = statusCode >= 500 ? "error" : "fail";

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status,
    message: err.message || "An unexpected error occurred",
  };

  // Add stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
