'use strict';

const { Review } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
   await Review.bulkCreate([
    {
    spotId: 1,
    userId: 4,
    review: 'Demo Review',
    stars: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    },
    {
    spotId: 1,
    userId: 4,
    review: 'Demo Review 2',
    stars: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    },
    {
    spotId: 2,
    userId: 4,
    review: 'Demo Review',
    stars: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    },
    {
    spotId: 2,
    userId: 3,
    review: 'Demo Review 2',
    stars: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    }
  ],{ validate: true });
},

async down (queryInterface, Sequelize) {
  options.tableName = 'Reviews';
  const Op = Sequelize.Op;
  return queryInterface.bulkDelete(options, {
    review: { [Op.in]: ['Demo Review', 'Demo Review 2'] }
  }, {});
},
};
