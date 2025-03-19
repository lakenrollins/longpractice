"use strict";

const { User, Spot, Review, ReviewImage } = require("../models");

module.exports = {
  async up(queryInterface, Sequelize) {
    const options = {};
    if (process.env.NODE_ENV === "production") {
      options.schema = process.env.SCHEMA; 
    }

    // Fetch demo users
    const demoUser = await User.findOne({ where: { username: "Demo-lition" } });
    const user1 = await User.findOne({ where: { username: "FakeUser1" } });
    const user2 = await User.findOne({ where: { username: "FakeUser2" } });

    // Check if the users are found
    if (!demoUser || !user1 || !user2) {
      throw new Error("One or more users could not be found.");
    }

    // Fetch all spots
    const spots = await Spot.findAll();

    // Check if there are at least 3 spots available
    if (spots.length < 3) {
      throw new Error("Not enough spots found in the database.");
    }

    // Create sample reviews
    const reviews = await Review.bulkCreate([
      { spotId: spots[0].id, userId: user1.id, stars: 5, review: "Amazing place!" },
      { spotId: spots[0].id, userId: user2.id, stars: 4, review: "Very nice, but a bit noisy." },
      { spotId: spots[1].id, userId: demoUser.id, stars: 5, review: "Loved it!" },
      { spotId: spots[1].id, userId: user2.id, stars: 3, review: "It was okay." },
      { spotId: spots[2].id, userId: user1.id, stars: 5, review: "Perfect experience!" },
    ], { returning: true });

    // Ensure reviews were created
    if (!reviews.length) {
      throw new Error("Failed to create reviews.");
    }

    // Create review images
    await ReviewImage.bulkCreate([
      { reviewId: reviews[0].id, url: "https://example.com/image1.jpg" },
      { reviewId: reviews[0].id, url: "https://example.com/image2.jpg" },
      { reviewId: reviews[2].id, url: "https://example.com/image3.jpg" },
    ]);
  },
};


const spots = await Spot.findAll({
  limit: 3,  // Limit the number of spots fetched
});
