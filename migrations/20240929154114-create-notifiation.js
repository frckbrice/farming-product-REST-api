'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(context) =>{
    const {queryInterface, Sequelize} = context.context

    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      title: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      isRead: {
        type: Sequelize.BOOLEAN
      },
      userId:{
        type:Sequelize.UUID,
        allowNull: false,
        reference: {
          model: 'User',
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

    await queryInterface.dropTable('Notifications');
  }
};