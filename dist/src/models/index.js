"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = require("path");
const fs_1 = tslib_1.__importDefault(require("fs"));
const sequelize_typescript_1 = require("sequelize-typescript");
const runMigrations_1 = tslib_1.__importDefault(require("../utils/runMigrations"));
// Use DATABASE_URL from .env (e.g. postgresql://user:pass@host:5432/dbname)
const rawUrl = ((_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.trim()) || "";
const connectionString = rawUrl &&
    rawUrl !== "undefined" &&
    (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))
    ? rawUrl
    : null;
const useConnectionString = connectionString !== null;
if (!useConnectionString) {
    throw new Error("Database not configured: set DATABASE_URL. " +
        "Locally: add it to .env. On Render/Docker: set DATABASE_URL in the service Environment (e.g. postgresql://user:pass@host:5432/dbname).");
}
if (rawUrl && rawUrl !== "undefined" && !useConnectionString) {
    throw new Error(`DATABASE_URL is set but invalid: must start with postgres:// or postgresql://. Got: ${rawUrl.slice(0, 30)}${rawUrl.length > 30 ? "..." : ""}`);
}
// Function to dynamically load models
const loadModels = () => {
    const modelsDir = __dirname;
    try {
        const modelFiles = fs_1.default.readdirSync(modelsDir);
        return modelFiles
            .filter((file) => (file.endsWith(".ts") || file.endsWith(".js")) &&
            !file.startsWith("index"))
            .map((file) => (0, path_1.join)(modelsDir, file));
    }
    catch (error) {
        console.error("Error loading models:", error);
        throw new Error("Failed to load models.");
    }
};
const models = loadModels();
if (models.length === 0) {
    throw new Error("No models found in the models directory.");
}
const sequelizeOptions = {
    dialect: "postgres",
    dialectOptions: process.env.NOD_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Use this we use a service that uses a self-signed certificate
            },
        }
        : {},
    logging: console.log, // Set to false to disable SQL query logging
    models: models,
};
const sequelize = new sequelize_typescript_1.Sequelize(connectionString, sequelizeOptions);
/**
 * Asynchronous (IIFE) for database synchronization and migration.
 *
 * 1. In development: alters the database structure (sync with alter).
 * 2. In production when RUN_MIGRATIONS=true: runs migrations only if there are pending ones (cheap check to avoid DB quota).
 * 3. Handles errors differently based on the process.env.NOD_ENV.
 *
 * @async
 * @function
 * @throws {Error} Throws an error if database synchronization fails.
 * @returns {Promise<void>} A promise that resolves when the database operations are complete.
 */
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (process.env.NODE_ENV === "development") {
            // Run any pending migrations first (e.g. userOTPCodes.expiredAt DATE→BIGINT)
            // so that sync({ alter: true }) does not hit PostgreSQL's "cannot be cast automatically" errors.
            yield (0, runMigrations_1.default)(sequelize);
            console.log("Altering the database...");
            yield sequelize.sync({ alter: true });
            console.log("✅ Database altered successfully.");
        }
        else if (process.env.NODE_ENV === "production" &&
            process.env.RUN_MIGRATIONS === "true") {
            // Only run migrations when there are pending ones (cheap check via SequelizeMeta).
            // Avoids heavy schema-diff and extra DB calls to respect Neon quota.
            yield (0, runMigrations_1.default)(sequelize);
        }
        else {
            console.log("✅ Database is up to date.");
        }
    }
    catch (error) {
        console.error("Error during database synchronization:", error);
        // More graceful error handling for production
        if (process.env.NODE_ENV === "production") {
            console.error("Database sync failed, but application will continue running with existing schema");
            // Consider sending an alert to your monitoring system here
        }
        else {
            process.exit(1); // Only exit in development
        }
    }
}))();
exports.default = sequelize;
