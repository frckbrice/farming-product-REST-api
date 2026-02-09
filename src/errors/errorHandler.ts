import { Request, Response, NextFunction } from "express";
import AppError from "./customErrors";

export interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

/**
 * Express error-handling middleware. Handles AppError with statusCode and
 * generic Error as 500. Exposes stack in development.
 */
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  console.log("Error handler called:", err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = "fail";

  const errorResponse: ErrorResponse = {
    status,
    message: err.message || "An unexpected error occurred",
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  console.log("Sending error response:", errorResponse);
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
