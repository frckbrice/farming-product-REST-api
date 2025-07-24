'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async(context) => {
    const {queryInterface, Sequelize} = context.context
    await queryInterface.createTable('userOTPCodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type:Sequelize.UUID,
          allowNull: false,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiredAt:{
        type: Sequelize.DATE,
        defaultValue: ()=> new Date(Date.now()+3600*20) // 10  minutes from now by default
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async(context) =>{
    const {queryInterface, Sequelize} = context.context
    await queryInterface.dropTable('userOTPCodes');
  }
};