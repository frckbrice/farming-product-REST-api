'use strict';

/**
 * Converts Roles.id from INTEGER to UUID so it matches User.roleId (UUID)
 * and the foreign key Users_roleId_fkey can be created.
 * Safe to run on DBs where Roles.id is already UUID (no-op).
 */
module.exports = {
  up: async (context) => {
    const { queryInterface } = context.context;
    const sequelize = queryInterface.sequelize;

    const [rows] = await sequelize.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Roles' AND column_name = 'id';
    `);
    if (rows.length === 0) return; // Roles table doesn't exist
    if (rows[0].data_type === 'uuid') return; // Already UUID, nothing to do

    // Roles.id is integer; convert to UUID (add column and backfill; DEFAULT only applies to new rows)
    await sequelize.query(`
      ALTER TABLE "Roles" ADD COLUMN IF NOT EXISTS "id_new" UUID;
    `);
    await sequelize.query(`UPDATE "Roles" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;`);

    // Drop FK if it exists (e.g. from a failed sync)
    await sequelize.query(`
      ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "Users_roleId_fkey";
    `);

    // Map Users.roleId (may be stored as text "1"/"2" or castable) to new UUIDs
    await sequelize.query(`
      UPDATE "Users" u
      SET "roleId" = r."id_new"
      FROM "Roles" r
      WHERE u."roleId"::text = r.id::text;
    `);

    // Replace id with id_new
    await sequelize.query(`ALTER TABLE "Roles" DROP CONSTRAINT "Roles_pkey";`);
    await sequelize.query(`ALTER TABLE "Roles" DROP COLUMN "id";`);
    await sequelize.query(`ALTER TABLE "Roles" RENAME COLUMN "id_new" TO "id";`);
    await sequelize.query(`ALTER TABLE "Roles" ADD PRIMARY KEY ("id");`);
  },

  down: async () => {
    // No safe way to revert INTEGER id from UUID; leave as-is
  },
};
