'use strict';

const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
   await Spot.bulkCreate([
    {
      ownerId: 1,
      address: '123 Main St',
      city: 'Cityville',
      state: 'CA',
      country: 'USA',
      lat: 37.7749,
      lng: -122.4194,
      name: 'Demo Spot 1',
      description: 'A spot next to water.',
      price: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: 2,
      address: '456 Oak St',
      city: 'Townsville',
      state: 'NY',
      country: 'USA',
      lat: 40.7128,
      lng: -74.0060,
      name: 'Demo Spot 2',
      description: 'A spot with lots of people.',
      price: 75,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: 3,
      address: '789 Pine St',
      city: 'Villagetown',
      state: 'TX',
      country: 'USA',
      lat: 32.7767,
      lng: -96.7970,
      name: 'Demo Spot 3',
      description: 'A spot with a great view.',
      price: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ], { validate: true });
 },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Demo Spot 1', 'Demo Spot 2', 'Demo Spot 3'] }
    }, {});
  },
};
