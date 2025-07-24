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
const config_1 = tslib_1.__importDefault(require("../config/config"));
const environment = ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) || "production";
const envConfig = config_1.default[environment];
if (!envConfig) {
    throw new Error(`No configuration found for environment: ${environment}`);
}
//external connection string
const connectionString = process.env.DATABASE_URL;
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
const sequelize = new sequelize_typescript_1.Sequelize(`${connectionString}`, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Use this we use a service that uses a self-signed certificate
        },
    },
    logging: console.log, // Set to false to disable SQL query logging
    models: models,
});
/**
 * Asynchronous (IIFE) for database synchronization and migration.
 *
 * This function performs the following tasks:
 * 1. In development environment, it alters the database structure.
 * 2. In production environment, it checks for schema, field, data-type changes and runs migrations if necessary.
 * 3. Handles errors differently based on the environment.
 *
 * @async
 * @function
 * @throws {Error} Throws an error if database synchronization fails.
 * @returns {Promise<void>} A promise that resolves when the database operations are complete.
 */
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (environment === "development") {
            console.log("Altering the database...");
            yield sequelize.sync({ alter: true });
            console.log("✅ Database altered successfully.");
        }
        else if (environment === "production" &&
            process.env.RUN_MIGRATIONS === "true") {
            // Use Sequelize's built-in schema comparison instead of raw SQL
            console.log("Checking for schema changes...");
            // Create a transaction to ensure consistency
            const transaction = yield sequelize.transaction();
            try {
                // Use Sequelize's queryInterface for safer schema operations
                const queryInterface = sequelize.getQueryInterface();
                // Track if we need to run migrations
                let hasSchemaChanges = false;
                // Check each model for changes
                for (const modelName in sequelize.models) {
                    const model = sequelize.models[modelName];
                    const tableName = model.tableName;
                    // Check if table exists
                    const tableExists = yield queryInterface.tableExists(tableName, { transaction });
                    if (!tableExists) {
                        console.log(`Schema change detected: New table ${tableName}`);
                        hasSchemaChanges = true;
                        break;
                    }
                    // Get current table description
                    const tableDescription = yield queryInterface.describeTable(tableName, {});
                    // Get model attributes
                    const modelAttributes = model.rawAttributes;
                    // Check for new or modified columns
                    for (const attributeName in modelAttributes) {
                        const attribute = modelAttributes[attributeName];
                        // Skip virtual fields
                        if (attribute.type.constructor.key === "VIRTUAL")
                            continue;
                        // Get the column info from database
                        const columnInfo = tableDescription[attributeName];
                        // If column doesn't exist, it's a new column
                        if (!columnInfo) {
                            console.log(`Schema change detected: New column ${tableName}.${attributeName}`);
                            hasSchemaChanges = true;
                            break;
                        }
                        const sequelizeType = attribute.type.constructor.key;
                        const dbType = columnInfo.type;
                        // Check type compatibility
                        if (!isTypeCompatible(sequelizeType, dbType)) {
                            console.log(`Schema change detected: Type change for ${tableName}.${attributeName}`);
                            hasSchemaChanges = true;
                            break;
                        }
                    }
                    if (hasSchemaChanges)
                        break;
                    // Check for removed columns
                    for (const columnName in tableDescription) {
                        if (!(columnName in modelAttributes) &&
                            !["id", "createdAt", "updatedAt"].includes(columnName)) {
                            // Skip standard Sequelize fields
                            console.log(`Schema change detected: Removed column ${tableName}.${columnName}`);
                            hasSchemaChanges = true;
                            break;
                        }
                    }
                    if (hasSchemaChanges)
                        break;
                }
                // Only run migrations if schema changes are detected
                if (hasSchemaChanges) {
                    yield transaction.commit();
                    console.log("Running migrations due to schema changes...");
                    yield (0, runMigrations_1.default)(sequelize);
                    console.log("✅ Migrations completed successfully.");
                }
                else {
                    yield transaction.commit();
                    console.log("No schema changes detected. Skipping migrations.");
                }
            }
            catch (err) {
                // Rollback transaction on error
                yield transaction.rollback();
                throw err;
            }
        }
        else {
            console.log("✅ Database is up to date.");
        }
    }
    catch (error) {
        console.error("Error during database synchronization:", error);
        // More graceful error handling for production
        if (environment === "production") {
            console.error("Database sync failed, but application will continue running with existing schema");
            // Consider sending an alert to your monitoring system here
        }
        else {
            process.exit(1); // Only exit in development
        }
    }
}))();
// Helper function to check type compatibility
function isTypeCompatible(sequelizeType, dbType) {
    // This is a simplified version - expand based on your database and types
    const typeMap = {
        STRING: ["character varying", "varchar", "text"],
        INTEGER: ["integer", "int", "int4"],
        BIGINT: ["bigint", "int8"],
        FLOAT: ["real", "float4"],
        DOUBLE: ["double precision", "float8"],
        DECIMAL: ["numeric", "decimal"],
        BOOLEAN: ["boolean", "bool"],
        DATE: ["timestamp", "timestamptz", "date"],
        DATEONLY: ["date"],
        UUID: ["uuid"],
        JSON: ["json", "jsonb"],
        JSONB: ["jsonb"],
        ARRAY: ["array"],
    };
    // Convert types to lowercase for comparison
    const normalizedSequelizeType = sequelizeType.toUpperCase();
    const normalizedDbType = dbType.toLowerCase();
    // Check if the database type is compatible with the Sequelize type
    return typeMap[normalizedSequelizeType]
        ? typeMap[normalizedSequelizeType].includes(normalizedDbType)
        : false;
}
exports.default = sequelize;
