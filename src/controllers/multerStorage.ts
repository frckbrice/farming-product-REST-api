import multer, { StorageEngine, MulterError, Multer } from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

// Define custom types for multer request and response
type MulterRequest = Request & { file?: unknown };
type MulterResponse = Response;

// Define the storage configuration
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "./public/assets/images");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Create multer instance with configuration
const upload: Multer = multer({
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
const uploadMiddleware = (fieldName: string) => {
  const middleware = upload.single(fieldName);

  return (
    req: MulterRequest,
    res: MulterResponse,
    next: NextFunction,
  ): void => {
    // Type assertion is necessary here due to multer's type incompatibility
    const multerReq = req as unknown as Request;
    const multerRes = res as unknown as Response;
    const multerMiddleware = middleware as unknown as (
      req: Request,
      res: Response,
      callback: (err: unknown) => void,
    ) => void;
    multerMiddleware(multerReq, multerRes, (err: unknown) => {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(new AppError("File size too large. Maximum size is 5MB", 400));
          return;
        }
        next(new AppError(err.message, 400));
        return;
      }
      if (err instanceof Error) {
        next(new AppError(err.message, 400));
        return;
      }
      next();
    });
  };
};

export default uploadMiddleware;
