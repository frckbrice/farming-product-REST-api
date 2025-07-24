'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (context) => {
    const { queryInterface, Sequelize } = context.context

    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      amount: {
        type: Sequelize.FLOAT
      },
      shipAddress: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      dispatchDetails: {
        type: Sequelize.JSON,
        allowNull: true, // or false depending on your requirement
      },
      dispatched: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(['pending', 'processing', "delivered", "dispatched"]),
        defaultValue: 'pending'
      },
      buyerId: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'User',
          key: 'id'
        }

      },
      sellerId: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'User',
          key: 'id'
        }
      },
      prodId: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'Product',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (context) => {
    const { queryInterface, Sequelize } = context.context

    await queryInterface.dropTable('Orders');
  }
};