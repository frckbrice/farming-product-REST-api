'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(context)=> {
    const {queryInterface, Sequelize} = context.context

    await queryInterface.createTable('buyerReviews', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      comment: {
        type: Sequelize.STRING
      },
      rating: {
        type: Sequelize.INTEGER
      },
      userId:{
          type:Sequelize.UUID,
          allowNull: false,
          reference: {
            model: 'User',
            key: 'id'
          }
      },
      prodId:{
          type:Sequelize.UUID,
          allowNull: false,
          reference: {
            model: 'Product',
            key: 'id'
          }
      },
      orderId:{
        type:Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'Order',
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
  down: async(context)=> {
    const {queryInterface, Sequelize} = context.context
    await queryInterface.dropTable('buyerReviews');
  }
};