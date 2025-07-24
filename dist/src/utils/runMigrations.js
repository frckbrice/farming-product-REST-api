"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const umzug_1 = require("umzug");
/**
 * Run database migrations
 * @param sequelize - Sequelize instance
 * @returns Promise<void>
 */
const runMigrations = (sequelize) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const umzug = new umzug_1.Umzug({
        migrations: {
            glob: ["migrations/*.js", { cwd: process.cwd() }],
        },
        context: sequelize.getQueryInterface(),
        storage: new umzug_1.SequelizeStorage({ sequelize }),
        logger: console,
    });
    try {
        yield umzug.up();
        console.log("✅ All migrations have been executed successfully.");
    }
    catch (error) {
        console.error("❌ Error running migrations:", error);
        throw error;
    }
});
exports.default = runMigrations;
