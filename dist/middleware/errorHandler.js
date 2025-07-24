"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
const errorHandler = (err, req, res, next) => {
    // If the error is not operational, convert it to an operational error
    if (!err.isOperational) {
        err = new customErrors_1.default("An unexpected error occurred", 500);
    }
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
exports.default = errorHandler;
