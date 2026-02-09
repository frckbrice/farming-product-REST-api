'use strict';
// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (context) => {
    const { queryInterface, Sequelize } = context.context;
    await queryInterface.createTable('Roles', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      roleName: {
        type: Sequelize.ENUM(),
        values: ['farmer', 'buyer'],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (context) => {
    const { queryInterface } = context.context;
    await queryInterface.dropTable('Roles');
  },
};