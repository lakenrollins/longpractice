'use strict';

const { Spot, SpotImage, User } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Setup options for production environment
    const options = {};
    if (process.env.NODE_ENV === 'production') {
      options.schema = process.env.SCHEMA;
    }

    // Find demo user
    const demoUser = await User.findOne({ where: { username: 'DemoUser' } });
    if (!demoUser) {
      throw new Error('Demo user not found');
    }

    // Create sample spots
    const spots = await Spot.bulkCreate([
      {
        ownerId: demoUser.id,
        address: '160 Spear St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        lat: 37.7916,
        lng: -122.3913,
        name: 'App Academy',
        description: 'A top coding bootcamp.',
        price: 150
      },
      {
        ownerId: demoUser.id,
        address: '123 Sun St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Sunny Retreat',
        description: 'A cozy retreat in sunny LA.',
        price: 200
      },
      {
        ownerId: demoUser.id,
        address: '789 Mountain Rd',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        lat: 39.7392,
        lng: -104.9903,
        name: 'Mountain View',
        description: 'Breathtaking mountain views.',
        price: 180
      }
    ], { returning: true });

    // Create sample spot images
    await SpotImage.bulkCreate([
      { spotId: spots[0].id, url: 'https://example.com/spot1-preview.jpg', preview: true },
      { spotId: spots[0].id, url: 'https://example.com/spot1-image.jpg', preview: false },
      { spotId: spots[1].id, url: 'https://example.com/spot2-preview.jpg', preview: true },
      { spotId: spots[2].id, url: 'https://example.com/spot3-preview.jpg', preview: true }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Spots', null, {});
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
