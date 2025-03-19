'use strict';

const { Model, Validator, User } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      // Define associations
  User.associate = (models) => {
    User.hasMany(models.Spot, {
      foreignKey: 'ownerId',
      onDelete: 'CASCADE', // Cascade delete when a User is deleted
    });

    User.hasMany(models.Review, {
      foreignKey: 'userId',
      onDelete: 'CASCADE', // Cascade delete when a User is deleted
    });

    User.hasMany(models.Booking, {
      foreignKey: 'userId',
      onDelete: 'CASCADE', // Cascade delete when a User is deleted
    });
  };

  return User;
};
    }
  }


  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'createdAt', 'updatedAt'],
        },
      },
    }
  );
  return User;


module.exports = User;