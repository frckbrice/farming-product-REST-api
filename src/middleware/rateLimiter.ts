import { rateLimit, Options } from "express-rate-limit";
import { AppError } from "../errors";

// Rate limiter configuration
const rateLimitConfig: Partial<Options> = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40, // Limit each IP to 40 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later",
  statusCode: 429, // Too Many Requests
  handler: () => {
    throw new AppError(
      "Too many requests from this IP, please try again later",
      429,
    );
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoint
    return req.path === "/health";
  },
};

const limiter = rateLimit(rateLimitConfig);

export default limiter;
