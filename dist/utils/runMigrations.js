"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const umzug_1 = require("umzug");
// Initialize your Sequelize instance
// const sequelize = new Sequelize({
//   username: process.env.PROD_DB_USERNAME as string,
//   password: process.env.PROD_DB_PASSWORD as string,
//   database: process.env.PROD_DB_NAME as string,
//   host: process.env.PROD_DB_HOSTNAME as string,
//   port: parseInt(process.env.PROD_DB_PORT as string, 10),
//   dialect: "postgres",
// });
// Configure Umzug for migrations
const runMigrations = (sequelize, force) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const umzug = new umzug_1.Umzug({
        migrations: {
            glob: "migrations/*.js", // Path to migrations
        },
        context: { queryInterface: sequelize.getQueryInterface(), Sequelize: sequelize_1.Sequelize },
        storage: new umzug_1.SequelizeStorage({ sequelize }),
        logger: console,
    });
    try {
        console.log("Database start connecting .");
        yield sequelize.authenticate();
        console.log("Database connected successfully.");
        console.log("Running migrations...");
        yield umzug.up(); // Runs all pending migrations
        console.log("All migrations have been executed successfully.");
    }
    catch (error) {
        console.error("Error running migrations:", error);
        process.exit(1); // Exit the process if migrations fail
    }
    finally {
        yield sequelize.close(); // Close connection after migrations
    }
});
exports.default = runMigrations;
