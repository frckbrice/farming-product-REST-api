"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const authCheck = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if authorization header is present
        if (!req.headers.authorization) {
            res.status(404).json({ message: "You are either not logged in or your session has expired" });
            return;
        }
        // Extract the token from the authorization header
        const token = req.headers.authorization.split(" ")[1];
        // Verify the token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the token is expired
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
            res.status(401).json({ auth: false, message: "Your session has expired" });
            return;
        }
        // Attach decoded token data to the request object
        req.userData = decodedToken;
        // Verify the userId parameter matches the token's user ID, if applicable
        if (req.params.userId && req.params.userId !== decodedToken.UserId) {
            res.status(404).json({ message: "You are not authorized for this, please log in using your account" });
            return;
        }
        // Proceed to the next middleware or route handler
        next();
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = authCheck;
