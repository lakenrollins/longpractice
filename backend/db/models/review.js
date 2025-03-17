const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Review extends Model {
    static associate(models) {
      // A Review belongs to a User
      Review.belongsTo(models.User, { foreignKey: 'userId' });
      // A Review belongs to a Spot
      Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
      // A Review has many ReviewImages with cascade delete
      Review.hasMany(models.ReviewImage, {
        foreignKey: 'reviewId',
        onDelete: 'CASCADE',
        hooks: true,
      });
    }
  }

  Review.init(
    {
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Spot ID is required' },
          isInt: { msg: 'Spot ID must be an integer' },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'User ID is required' },
          isInt: { msg: 'User ID must be an integer' },
        },
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Review is required' },
          notEmpty: { msg: 'Review cannot be empty' },
        },
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Stars rating is required' },
          isInt: { msg: 'Stars must be an integer' },
          min: { args: [1], msg: 'Stars must be at least 1' },
          max: { args: [5], msg: 'Stars cannot be more than 5' },
        },
      },
    },
    {
      sequelize,
      modelName: 'Review',
    }
  );

  return Review;
};
