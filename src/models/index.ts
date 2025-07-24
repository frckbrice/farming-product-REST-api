import dotenv from "dotenv";
dotenv.config();
import { join } from "path";
import fs from "fs";
import { Transaction, QueryInterface } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import runMigrations from "../utils/runMigrations";
import config from "../config/config";

interface SequelizeTypeMap {
  [key: string]: string[];
}

interface SequelizeType {
  constructor: {
    key: string;
  };
}

interface ModelAttribute {
  type: SequelizeType;
  [key: string]: unknown;
}

const environment = process.env?.NODE_ENV || "production";
const envConfig = config[environment as keyof typeof config];

if (!envConfig) {
  throw new Error(`No configuration found for environment: ${environment}`);
}

//external connection string
const connectionString = process.env.DATABASE_URL;

// Function to dynamically load models
const loadModels = (): string[] => {
  const modelsDir = __dirname;
  try {
    const modelFiles = fs.readdirSync(modelsDir);
    return modelFiles
      .filter(
        (file) =>
          (file.endsWith(".ts") || file.endsWith(".js")) &&
          !file.startsWith("index"),
      )
      .map((file) => join(modelsDir, file));
  } catch (error) {
    console.error("Error loading models:", error);
    throw new Error("Failed to load models.");
  }
};

const models = loadModels();
if (models.length === 0) {
  throw new Error("No models found in the models directory.");
}

const sequelize = new Sequelize(`${connectionString}`, {
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
(async () => {
  try {
    if (environment === "development") {
      console.log("Altering the database...");
      await sequelize.sync({ alter: true });
      console.log("✅ Database altered successfully.");
    } else if (
      environment === "production" &&
      process.env.RUN_MIGRATIONS === "true"
    ) {
      // Use Sequelize's built-in schema comparison instead of raw SQL
      console.log("Checking for schema changes...");

      // Create a transaction to ensure consistency
      const transaction: Transaction = await sequelize.transaction();

      try {
        // Use Sequelize's queryInterface for safer schema operations
        const queryInterface: QueryInterface = sequelize.getQueryInterface();

        // Track if we need to run migrations
        let hasSchemaChanges = false;

        // Check each model for changes
        for (const modelName in sequelize.models) {
          const model = sequelize.models[modelName] as unknown as {
            tableName: string;
            rawAttributes: Record<string, ModelAttribute>;
          };
          const tableName = model.tableName;

          // Check if table exists
          const tableExists = await queryInterface.tableExists(tableName, {
            transaction,
          });

          if (!tableExists) {
            console.log(`Schema change detected: New table ${tableName}`);
            hasSchemaChanges = true;
            break;
          }

          // Get current table description
          const tableDescription = await queryInterface.describeTable(
            tableName,
            {},
          );

          // Get model attributes
          const modelAttributes = model.rawAttributes;

          // Check for new or modified columns
          for (const attributeName in modelAttributes) {
            const attribute = modelAttributes[attributeName];

            // Skip virtual fields
            if (attribute.type.constructor.key === "VIRTUAL") continue;

            // Get the column info from database
            const columnInfo = tableDescription[attributeName];

            // If column doesn't exist, it's a new column
            if (!columnInfo) {
              console.log(
                `Schema change detected: New column ${tableName}.${attributeName}`,
              );
              hasSchemaChanges = true;
              break;
            }

            const sequelizeType = attribute.type.constructor.key;
            const dbType = columnInfo.type;

            // Check type compatibility
            if (!isTypeCompatible(sequelizeType, dbType)) {
              console.log(
                `Schema change detected: Type change for ${tableName}.${attributeName}`,
              );
              hasSchemaChanges = true;
              break;
            }
          }

          if (hasSchemaChanges) break;

          // Check for removed columns
          for (const columnName in tableDescription) {
            if (
              !(columnName in modelAttributes) &&
              !["id", "createdAt", "updatedAt"].includes(columnName)
            ) {
              // Skip standard Sequelize fields
              console.log(
                `Schema change detected: Removed column ${tableName}.${columnName}`,
              );
              hasSchemaChanges = true;
              break;
            }
          }

          if (hasSchemaChanges) break;
        }

        // Only run migrations if schema changes are detected
        if (hasSchemaChanges) {
          await transaction.commit();
          console.log("Running migrations due to schema changes...");
          await runMigrations(sequelize);
          console.log("✅ Migrations completed successfully.");
        } else {
          await transaction.commit();
          console.log("No schema changes detected. Skipping migrations.");
        }
      } catch (err) {
        // Rollback transaction on error
        await transaction.rollback();
        throw err;
      }
    } else {
      console.log("✅ Database is up to date.");
    }
  } catch (error) {
    console.error("Error during database synchronization:", error);
    // More graceful error handling for production
    if (environment === "production") {
      console.error(
        "Database sync failed, but application will continue running with existing schema",
      );
      // Consider sending an alert to your monitoring system here
    } else {
      process.exit(1); // Only exit in development
    }
  }
})();

// Helper function to check type compatibility
function isTypeCompatible(sequelizeType: string, dbType: string): boolean {
  // This is a simplified version - expand based on your database and types
  const typeMap: SequelizeTypeMap = {
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

export default sequelize;
