'use strict';
const { 
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Application.belongsTo(models.User,{
        foreignKey:'userId',
        as:'user'
      })
    }
  };
  Application.init({
    userId:DataTypes.INTEGER,
    appName: DataTypes.STRING,
    appImage: DataTypes.STRING,
    appUrl: DataTypes.STRING,
    description: DataTypes.STRING,
    isApprove:DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};