"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = require("express-rate-limit");
const errors_1 = require("../errors");
// Rate limiter configuration
const rateLimitConfig = {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 40, // Limit each IP to 40 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again later",
    statusCode: 429, // Too Many Requests
    handler: () => {
        throw new errors_1.AppError("Too many requests from this IP, please try again later", 429);
    },
    skip: (req) => {
        // Skip rate limiting for health check endpoint
        return req.path === "/health";
    },
};
const limiter = (0, express_rate_limit_1.rateLimit)(rateLimitConfig);
exports.default = limiter;
