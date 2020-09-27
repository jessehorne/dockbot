'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    name: DataTypes.STRING,
    discord_id: DataTypes.STRING,
    karma: DataTypes.INTEGER,
    exp: DataTypes.INTEGER,
    wallet: DataTypes.INTEGER,
    bank: DataTypes.INTEGER,
    total_commands: DataTypes.INTEGER,
    waittime: DataTypes.INTEGER,
    hp: DataTypes.INTEGER,
    inventory: {
      type: DataTypes.TEXT
    },
    used_brass: {
      type: DataTypes.BOOLEAN
    },
    max_hp: {
      type: DataTypes.INTEGER
    },
    strength: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};
