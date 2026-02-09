import { Request, Response, NextFunction } from "express";
import jwt, {
  JwtPayload,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { AppError } from "../errors";

interface DecodedToken extends JwtPayload {
  UserId: string;
}

export interface AuthenticatedRequest extends Request {
  userData?: DecodedToken;
}

const authCheck = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Check if authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        message: "You are either not logged in or your session has expired",
      });
      return;
    }

    // Extract the token from the authorization header
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      res.status(401).json({
        message: "Invalid authorization header format",
      });
      return;
    }

    // Verify the token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as DecodedToken;

    // Check if the token is expired
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      res.status(401).json({
        auth: false,
        message: "Your session has expired",
      });
      return;
    }

    // Attach decoded token data to the request object
    req.userData = decodedToken;

    // Verify the userId parameter matches the token's user ID, if applicable
    if (req.params.userId && req.params.userId !== decodedToken.UserId) {
      res.status(403).json({
        message:
          "You are not authorized for this, please log in using your account",
      });
      return;
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        message: "Your session has expired",
      });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    // Handle unexpected errors
    next(new AppError("Authentication error", 500));
  }
};

export default authCheck;
