'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      discord_id: {
        type: Sequelize.STRING
      },
      karma: {
        type: Sequelize.INTEGER
      },
      exp: {
        type: Sequelize.INTEGER
      },
      wallet: {
        type: Sequelize.INTEGER
      },
      bank: {
        type: Sequelize.INTEGER
      },
      total_commands: {
        type: Sequelize.INTEGER
      },
      waittime: {
        type: Sequelize.INTEGER
      },
      hp: {
        type: Sequeliez.INTEGER
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
