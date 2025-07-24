import { Sequelize } from "sequelize-typescript";
import { Umzug, SequelizeStorage } from "umzug";

/**
 * Run database migrations
 * @param sequelize - Sequelize instance
 * @returns Promise<void>
 */
const runMigrations = async (sequelize: Sequelize): Promise<void> => {
  const umzug = new Umzug({
    migrations: {
      glob: ["migrations/*.js", { cwd: process.cwd() }],
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  try {
    await umzug.up();
    console.log("✅ All migrations have been executed successfully.");
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    throw error;
  }
};

export default runMigrations;
