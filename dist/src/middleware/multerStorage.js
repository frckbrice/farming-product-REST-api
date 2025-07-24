"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importStar(require("multer"));
const path_1 = tslib_1.__importDefault(require("path"));
const customErrors_1 = tslib_1.__importDefault(require("../errors/customErrors"));
// Define the Multer storage
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "./src/public/images");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Factory function to create the upload middleware
const uploadMiddleware = (fieldName) => {
    const upload = (0, multer_1.default)({
        storage,
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith("image")) {
                cb(new Error("Uploaded file is not supported. Please upload an image"));
                return;
            }
            cb(null, true);
        },
    }).single(fieldName);
    return (req, res, next) => {
        // We need to use any here because of type incompatibility between Express and Multer
        // This is safe because Multer extends Express types internally
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const multerReq = req;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const multerRes = res;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const multerUpload = upload;
        multerUpload(multerReq, multerRes, (err) => {
            if (err instanceof multer_1.MulterError) {
                next(new customErrors_1.default(err.message, 400));
                return;
            }
            if (err instanceof Error) {
                next(new customErrors_1.default(err.message, 400));
                return;
            }
            next();
        });
    };
};
exports.default = uploadMiddleware;
