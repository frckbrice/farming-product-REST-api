import { Sequelize as SequelizeConstructor } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

function createUmzug(sequelize: SequelizeConstructor) {
  return new Umzug({
    migrations: {
      glob: ["migrations/*.js", { cwd: process.cwd() }],
    },
    context: {
      queryInterface: sequelize.getQueryInterface(),
      Sequelize: SequelizeConstructor,
    },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
}

/**
 * Check if there are pending migrations (single cheap DB read).
 * Use this to avoid running migrations unnecessarily and hitting DB quota.
 */
export const hasPendingMigrations = async (
  sequelize: SequelizeConstructor,
): Promise<boolean> => {
  const umzug = createUmzug(sequelize);
  const pending = await umzug.pending();
  return pending.length > 0;
};

/**
 * Run database migrations only when there are pending ones.
 * Skips work when up-to-date to avoid hitting DB quota (e.g. Neon).
 * @param sequelize - Sequelize instance (sequelize or sequelize-typescript)
 * @returns Promise<void>
 */
const runMigrations = async (
  sequelize: SequelizeConstructor,
): Promise<void> => {
  const umzug = createUmzug(sequelize);

  try {
    const pending = await umzug.pending();
    if (pending.length === 0) {
      console.log("No pending migrations. Skipping.");
      return;
    }
    await umzug.up();
    console.log("✅ All migrations have been executed successfully.");
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    throw error;
  }
};

export default runMigrations;
