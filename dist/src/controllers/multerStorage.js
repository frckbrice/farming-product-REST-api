"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importStar(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const errors_1 = require("../errors");
// Define the storage configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "./public/assets/images");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Create multer instance with configuration
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (_req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.startsWith("image")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});
// Factory function to create the upload middleware
const uploadMiddleware = (fieldName) => {
    const middleware = upload.single(fieldName);
    return (req, res, next) => {
        // Type assertion is necessary here due to multer's type incompatibility
        const multerReq = req;
        const multerRes = res;
        const multerMiddleware = middleware;
        multerMiddleware(multerReq, multerRes, (err) => {
            if (err instanceof multer_1.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    next(new errors_1.AppError("File size too large. Maximum size is 5MB", 400));
                    return;
                }
                next(new errors_1.AppError(err.message, 400));
                return;
            }
            if (err instanceof Error) {
                next(new errors_1.AppError(err.message, 400));
                return;
            }
            next();
        });
    };
};
exports.default = uploadMiddleware;
