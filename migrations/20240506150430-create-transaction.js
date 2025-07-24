'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(context) =>{
    const {queryInterface, Sequelize} = context.context

    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      amount: {
        type: Sequelize.FLOAT
      },
      status: {
        type: Sequelize.ENUM(['pending','completed','rejected']),
        defaultValue: 'pending'
      },
      txType: {
        type: Sequelize.ENUM(['Payment', 'Refund']),
        defaultValue: 'Payment'
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'XAF',
      },
      txMethod: {
        type: Sequelize.ENUM(['MOBILE-MONEY','ORANGE-MONEY','VISA','MASTERCARD'])
      },
      txDetails: {
        type: Sequelize.JSON
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

    await queryInterface.dropTable('Transactions');
  }
};