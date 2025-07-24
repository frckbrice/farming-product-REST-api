import { Request, Response, NextFunction } from "express";
import AppError from "../errors/customErrors";

interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.log('Error handler called:', err);

  // Set default values
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = "fail"; // Always use 'fail' for consistency with tests

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status,
    message: err.message || "An unexpected error occurred",
  };

  // Add stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  console.log('Sending error response:', errorResponse);
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
