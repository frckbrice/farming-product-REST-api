/**
 * Standalone script to run all pending database migrations.
 * Uses a minimal Sequelize instance (no models) to avoid running the app's sync IIFE.
 * Run from project root: yarn db:migrate or npm run db:migrate
 */
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import runMigrations from "../src/utils/runMigrations";

const environment = process.env.NODE_ENV || "development";
const connectionString = process.env.DATABASE_URL?.trim();
const useConnectionString =
  connectionString && connectionString !== "undefined";

if (!useConnectionString && !process.env.DB_NAME) {
  console.error(
    "Database not configured: set DATABASE_URL or DB_NAME, DB_HOST, DB_USERNAME, DB_PASSWORD in .env"
  );
  process.exit(1);
}

const sequelizeOptions = {
  dialect: "postgres" as const,
  logging: false,
  ...(environment === "production" && {
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }),
};

const sequelize = useConnectionString
  ? new Sequelize(connectionString!, sequelizeOptions)
  : new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USERNAME!,
    process.env.DB_PASSWORD!,
    { ...sequelizeOptions, host: process.env.DB_HOST }
  );

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
    await runMigrations(sequelize);
    console.log("Migrations completed.");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await sequelize.close().catch(() => { });
    process.exit(1);
  }
}

main();
