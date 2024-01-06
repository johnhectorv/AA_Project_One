'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Spots', [
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
   ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Spots', null, {});
  },
};
