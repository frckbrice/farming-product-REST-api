"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
const errorHandler = (err, req, res) => {
    // Set default values
    const statusCode = err instanceof customErrors_1.default ? err.statusCode : 500;
    const status = statusCode >= 500 ? "error" : "fail";
    // Prepare error response
    const errorResponse = {
        status,
        message: err.message || "An unexpected error occurred",
    };
    // Add stack trace in development environment
    if (process.env.NODE_ENV === "development") {
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.default = errorHandler;
