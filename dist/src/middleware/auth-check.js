"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importStar(require("jsonwebtoken"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
const authCheck = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
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
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the token is expired
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
            res.status(401).json({
                auth: false,
                message: "Your session has expired"
            });
            return;
        }
        // Attach decoded token data to the request object
        req.userData = decodedToken;
        // Verify the userId parameter matches the token's user ID, if applicable
        if (req.params.userId && req.params.userId !== decodedToken.UserId) {
            res.status(403).json({
                message: "You are not authorized for this, please log in using your account",
            });
            return;
        }
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(401).json({
                message: "Your session has expired"
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            res.status(401).json({
                message: "Invalid token"
            });
            return;
        }
        // Handle unexpected errors
        next(new customErrors_1.default("Authentication error", 500));
    }
});
exports.default = authCheck;
