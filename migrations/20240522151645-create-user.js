'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (context) => {
    const { queryInterface, Sequelize } = context.context

    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      shipAddress: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      country: {
        type: Sequelize.STRING
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      phoneNum: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      facebookId: {
        type: Sequelize.STRING,
        allowNull: true, // or false depending on your requirement
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: true, // or false depending on your requirement
      },
      expoPushToken: {
        type: Sequelize.STRING,
        allowNull: true, // or false depending on your requirement
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'Role',
          key: 'id'
        }
      },
      vip: {
        type: Sequelize.BOOLEAN,
        defaulValue: false
      },
      verifiedUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaulValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (context) => {
    const { queryInterface, Sequelize } = context.context

    await queryInterface.dropTable('Users');
  }
};