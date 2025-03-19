const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Spot extends Model {
    static associate(models) {
      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' });
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
      Spot.hasMany(models.Review, { foreignKey: 'spotId' });
    }
  }

  Spot.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Owner ID is required' },
          isInt: { msg: 'Owner ID must be an integer' },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Address is required' },
        },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'City is required' },
        },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'State is required' },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Country is required' },
        },
      },
      lat: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: -90,
          max: 90,
          notNull: { msg: 'Latitude is required' },
        },
      },
      lng: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          min: -180,
          max: 180,
          notNull: { msg: 'Longitude is required' },
        },
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: { args: [1, 50], msg: 'Name must be between 1 and 50 characters' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Description is required' },
        },
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          isDecimal: { msg: 'Price must be a decimal value' },
          min: { args: [0], msg: 'Price must be a positive number' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Spot',
    }
  );

  return Spot;
};
