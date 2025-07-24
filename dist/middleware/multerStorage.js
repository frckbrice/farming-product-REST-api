"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importStar(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Define the Multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Define the file filter
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(new customErrors_1.default('Uploaded file is not supported. Please upload an image', 400), false);
    }
    else {
        cb(null, true);
    }
};
// Factory function to create the upload middleware
const uploadMiddleware = (fieldName) => {
    const upload = (0, multer_1.default)({
        storage: storage,
        fileFilter: fileFilter,
    }).single(fieldName); // Use the provided field name
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err instanceof multer_1.MulterError) {
                // Handle Multer-specific errors
                return next(new customErrors_1.default(err.message, 400));
            }
            else if (err) {
                // Handle other unknown errors
                return next(new customErrors_1.default(err.message, 400));
            }
            // Everything went fine
            next();
        });
    };
};
exports.default = uploadMiddleware;
