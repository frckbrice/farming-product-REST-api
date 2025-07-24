'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   up: async(context)=> {
    const {queryInterface, Sequelize} = context.context
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaulValue: Sequelize.UUIDv4
      },
      productName: {
        type: Sequelize.STRING
      },
      productCat: {
        type: Sequelize.STRING
      },
      priceType: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      wholeSale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.dropTable('Products');
  }
};