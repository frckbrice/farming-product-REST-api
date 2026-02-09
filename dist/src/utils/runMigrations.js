"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPendingMigrations = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const umzug_1 = require("umzug");
function createUmzug(sequelize) {
    return new umzug_1.Umzug({
        migrations: {
            glob: ["migrations/*.js", { cwd: process.cwd() }],
        },
        context: {
            queryInterface: sequelize.getQueryInterface(),
            Sequelize: sequelize_1.Sequelize,
        },
        storage: new umzug_1.SequelizeStorage({ sequelize }),
        logger: console,
    });
}
/**
 * Check if there are pending migrations (single cheap DB read).
 * Use this to avoid running migrations unnecessarily and hitting DB quota.
 */
const hasPendingMigrations = (sequelize) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const umzug = createUmzug(sequelize);
    const pending = yield umzug.pending();
    return pending.length > 0;
});
exports.hasPendingMigrations = hasPendingMigrations;
/**
 * Run database migrations only when there are pending ones.
 * Skips work when up-to-date to avoid hitting DB quota (e.g. Neon).
 * @param sequelize - Sequelize instance (sequelize or sequelize-typescript)
 * @returns Promise<void>
 */
const runMigrations = (sequelize) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const umzug = createUmzug(sequelize);
    try {
        const pending = yield umzug.pending();
        if (pending.length === 0) {
            console.log("No pending migrations. Skipping.");
            return;
        }
        yield umzug.up();
        console.log("✅ All migrations have been executed successfully.");
    }
    catch (error) {
        console.error("❌ Error running migrations:", error);
        throw error;
    }
});
exports.default = runMigrations;
