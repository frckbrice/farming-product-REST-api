'use strict';

/**
 * Converts userOTPCodes.expiredAt from DATE/TIMESTAMP to BIGINT (ms since epoch)
 * so it matches the Sequelize model (DataType.BIGINT).
 * Safe to run if the column is already BIGINT (no-op).
 */
module.exports = {
  up: async (context) => {
    const { queryInterface } = context.context || context;
    const sequelize = queryInterface.sequelize;

    const [rows] = await sequelize.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'userOTPCodes' AND column_name = 'expiredAt';
    `);
    if (rows.length === 0) return; // table/column doesn't exist
    if (rows[0].data_type === 'bigint') return; // already BIGINT

    await sequelize.query(`
      ALTER TABLE "userOTPCodes"
        ALTER COLUMN "expiredAt" DROP DEFAULT,
        ALTER COLUMN "expiredAt" DROP NOT NULL;
    `);
    await sequelize.query(`
      ALTER TABLE "userOTPCodes"
        ALTER COLUMN "expiredAt" TYPE BIGINT
        USING (ROUND(EXTRACT(EPOCH FROM "expiredAt") * 1000))::BIGINT;
    `);
  },

  down: async (context) => {
    const { queryInterface } = context.context || context;
    const sequelize = queryInterface.sequelize;

    const [rows] = await sequelize.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'userOTPCodes' AND column_name = 'expiredAt';
    `);
    if (rows.length === 0 || rows[0].data_type !== 'bigint') return;

    await sequelize.query(`
      ALTER TABLE "userOTPCodes"
        ALTER COLUMN "expiredAt" TYPE TIMESTAMP WITH TIME ZONE
        USING (to_timestamp("expiredAt" / 1000.0) AT TIME ZONE 'UTC');
    `);
  },
};
