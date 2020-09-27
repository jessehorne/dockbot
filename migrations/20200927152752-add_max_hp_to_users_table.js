'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'max_hp', {
      type: Sequelize.INTEGER,
      defaultValue: 100
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'max_hp');
  }
};
