const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review, Booking, ReviewImage } = require('../../db/models/');

const router = express.Router();

const validateQuery = [
  check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be an integer greater than or equal to 1'),

  check('size')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Size must be an integer between 1 and 20'),

  check('minLat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Minimum latitude must be within -90 and 90'),

  check('maxLat')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Maximum latitude must be within -90 and 90'),

  check('minLng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Minimum longitude must be within -180 and 180'),

  check('maxLng')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Maximum longitude must be within -180 and 180'),

  check('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),

  check('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),

  handleValidationErrors
];

function averagePairs(arr) {
  const result = [];
  const sums = {};
  const counts = {};

  arr.forEach(pair => {
    const key = pair[0];

    if (!sums[key]) {
      sums[key] = 0;
      counts[key] = 0;
    }

    sums[key] += pair[1];
    counts[key]++;
  });

  for (const key in sums) {
    const avg = sums[key] / counts[key];
    result.push([parseInt(key), avg]);
  }

  return result;
}

router.get('/', validateQuery, async (req, res) => {
    try {
      const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

      const filter = {
        where: {}
      };

      if (minLat !== undefined) {
        filter.where.lat = { [Op.gte]: minLat };
    }

    if (maxLat !== undefined) {
        filter.where.lat = { ...filter.where.lat, [Op.lte]: maxLat };
    }

    if (minLng !== undefined) {
        filter.where.lng = { [Op.gte]: minLng };
    }

    if (maxLng !== undefined) {
        filter.where.lng = { ...filter.where.lng, [Op.lte]: maxLng };
    }

    if (minPrice !== undefined) {
        filter.where.price = { [Op.gte]: minPrice };
    }

    if (maxPrice !== undefined) {
        filter.where.price = { ...filter.where.price, [Op.lte]: maxPrice };
    }


      filter.include = [
        {
          model: SpotImage,
          attributes: ['url'],
        },
        {
          model: Review,
        }
      ];

      const spots = await Spot.findAll(filter);


      let response = [];

      for (let i = 0;  i < size && i < spots.length; i++) {
        let avgStarRating = null;

        if (spots[i].Reviews && spots[i].Reviews.length > 0) {
          const reviewData = spots[i].Reviews.map(e => [e.spotId, e.stars]);
          const averageRating = averagePairs(reviewData);

          if (averageRating.length > 0) {
            avgStarRating = averageRating[0][1];
          }
        }

        let previewImage = null;
        if (spots[i].SpotImages && spots[i].SpotImages.length > 0) {
          previewImage = spots[i].SpotImages[0].url;
        }

        response.push({
          id: spots[i].id,
          ownerId: spots[i].ownerId,
          address: spots[i].address,
          city: spots[i].city,
          state: spots[i].state,
          country: spots[i].country,
          lat: parseInt(spots[i].lat),
          lng: parseInt(spots[i].lng),
          name: spots[i].name,
          description: spots[i].description,
          price: spots[i].price,
          createdAt: spots[i].createdAt,
          updatedAt: spots[i].updatedAt,
          avgStarRating: avgStarRating,
          previewImage: previewImage
        });
      }



      res.json({
        Spots: response,
        page: page,
        size: size
      });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'No Data Found' });
    }
});

router.get('/current', requireAuth, async (req, res) => {
    try {

      const spots = await Spot.findAll({
        where: { ownerId: req.user.id},
        include: [
          {
            model: SpotImage,
            attributes: ['url'],
          },
          {
            model: Review,
          }
        ]
      });


      let response = [];

      for (let i = 0;  i < spots.length; i++) {
        let avgStarRating = null;

        if (spots[i].Reviews && spots[i].Reviews.length > 0) {
          const reviewData = spots[i].Reviews.map(e => [e.spotId, e.stars]);
          const averageRating = averagePairs(reviewData);

          if (averageRating.length > 0) {
            avgStarRating = averageRating[0][1];
          }
        }

        let previewImage = null;
        if (spots[i].SpotImages && spots[i].SpotImages.length > 0) {
          previewImage = spots[i].SpotImages[0].url;
        }

        response.push({
          id: spots[i].id,
          ownerId: spots[i].ownerId,
          address: spots[i].address,
          city: spots[i].city,
          state: spots[i].state,
          country: spots[i].country,
          lat: parseInt(spots[i].lat),
          lng: parseInt(spots[i].lng),
          name: spots[i].name,
          description: spots[i].description,
          price: spots[i].price,
          createdAt: spots[i].createdAt,
          updatedAt: spots[i].updatedAt,
          avgStarRating: avgStarRating,
          previewImage: previewImage
        });
      }

        res.json({Spots: response});
    } catch (error) {
        console.error('Error retrieving owned spots:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be within -90 and 90'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be within -180 and 180'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .isFloat({ gt: 0 })
    .withMessage('Price per day must be a positive number'),
  handleValidationErrors
];

router.post('/', requireAuth, validateSpot, async (req, res) => {
  try {
    const ownerId =  req.user.id;

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    const newSpot = await Spot.create({
       ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    res.status(201).json(newSpot);

  } catch (error) {
    console.error('Error creating spot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:spotId', async (req, res) => {
  try {
    const spotId = req.params.spotId; //4

    const spot = await Spot.findOne({
      where: { id: spotId },
       include: [
        { model: SpotImage, attributes: ['id', 'url', 'preview']},
        { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!spot) {
      return res.status(404).json({message: 'Spot couldn\'t be found'})
    }

    const reviews = await Review.findAll({
      attributes: ['stars'],
      where: {
        spotId: spotId
      }
    });

    const numReviews = reviews.length;

    const stars = reviews.map(e => e.stars);

    let sumStars = 0;

    stars.forEach(e => sumStars += e);

    const avgStarRating = sumStars/numReviews;

    const response = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: parseInt(spot.lat),
      lng: parseInt(spot.lng),
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews: numReviews,
      avgStarRating: avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    res.status(200).json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:spotId', requireAuth, async (req, res) => {
  try{
    const spotId = req.params.spotId;

    const spot = await Spot.findOne({
      where: { id: spotId}
    });

    const authorized = spot.ownerId === req.user.id;

    if (!spot) {
      return res.status(404).json({message: 'Spot couldn\'t be found'})
    };

    if (spot && authorized) {
      await Spot.destroy({
        where: { id:spotId }
      });
    }

    if (spot && !authorized) {
      return res.status(404).json({message: 'Forbidden'})
    }

    res.status(200).json({ message: 'Successfully deleted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    const spot = await Spot.findOne({
      where: { id: spotId },
    });

    if(!spot) {
      return res.status(404).json({
        message: 'Spot couldn\'t be found'
      });
    }

    if (!(spot.ownerId === req.user.id)) {
      return res.status(404).json({message: 'Forbidden'})
    };

    await Spot.update({
      address: address,
      city: city,
      state: state,
      country: country,
      lat: lat,
      lng: lng,
      name: name,
      description: description,
      price: price,
    },
    {
      where: { id: spotId }
    });

    res.status(200).json({
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: parseInt(spot.lat),
      lng: parseInt(spot.lng),
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/:spotId/images', requireAuth, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const { url, preview } = req.body;
    //const ownerId = req.user.id;

    const spot = await Spot.findOne({ where: { id: spotId } });

    if (!spot) {
      return res.status(404).json({message: 'Spot couldn\'t be found'})
    };

    if (!(spot.ownerId === req.user.id)) {
      return res.status(404).json({message: 'Forbidden'})
    };

    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
    });

    res.status(200).json({ id: newImage.id, url: newImage.url, preview: newImage.preview });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:spotId/reviews', async (req, res) => {
  try {
      const spotId = req.params.spotId;

      const spot = await Spot.findOne({ where: { id: spotId } });

      if (!spot) {
        return res.status(404).json({message: 'Spot couldn\'t be found'})
      };

      const ownedReviews = await Review.findAll({
          where: { spotId: spotId },
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName'],
            },
            {
              model: ReviewImage,
              attributes: ['id', 'url'],
            }
          ]
      });

      res.json({
        Reviews: ownedReviews.map((e) => ({
          id: e.id,
          userId: e.userId,
          spotId: e.spotId,
          review: e.review,
          stars: e.stars,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          User: {
            id: e.User.id,
            firstName: e.User.firstName,
            lastName: e.User.lastName
          },
          ReviewImages: e.ReviewImages.map(image => ({
            id: image.id,
            url: image.url
          }))
        }))
      });
  } catch (error) {
      console.error('Error retrieving owned reviews:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { review, stars } = req.body;

    if (!review || !stars || isNaN(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: {
          review: 'Review text is required',
          stars: 'Stars must be an integer from 1 to 5',
        },
      });
    }

    const spot = await Spot.findOne({ where: { id: spotId } });

    if (!spot) {
      return res.status(404).json({message: 'Spot couldn\'t be found'})
    };

    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        spotId: spot.id,
      },
    });

    if (existingReview) {
      return res.status(500).json({
        message: 'User already has a review for this spot',
      });
    }

    const newReview = await Review.create({
      userId: req.user.id,
      spotId: spot.id,
      review,
      stars,
    });

    return res.status(201).json({
      id: newReview.id,
      userId: newReview.userId,
      spotId: newReview.spotId,
      review: newReview.review,
      stars: newReview.stars,
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});

router.get('/:spotId/bookings', requireAuth, restoreUser, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const userId = req.user.id;

    console.log('User: ' + userId);

    const spot = await Spot.findOne({
      where: { id: spotId },
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

      const spotBookings = await Booking.findAll({
        where: {
          [Op.and]: [
            { spotId: spotId },
          ]
        },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });

      if(spot.ownerId === req.user.id) {
      res.status(200).json({ Bookings: spotBookings.map((e) => ({
        User: {
          id: e.User.id,
          firstName: e.User.firstName,
          lastName: e.User.lastName
        },
        id: e.id,
        spotId: e.spotId,
        userId: e.userId,
        startDate: e.startDate,
        endDate: e.endDate,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
        }))
      });
      } else {
        res.status(200).json({Bookings: spotBookings.map((e) => ({
          spotId: e.spotId,
          startDate: e.startDate,
          endDate: e.endDate
        }))})
      }


  } catch (error) {
    console.error('Error retrieving spot bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/:spotId/bookings', requireAuth, async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    const spot = await Spot.findOne({
      where: { id: spotId },
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId === userId) {
      return res.status(403).json({ message: 'Forbidden'});
    }

    const endDateConflict = await Booking.findOne({
      where: {
        [Op.or]: [
          {endDate: { [Op.eq]: new Date(endDate) } },
          {startDate: { [Op.eq]: new Date(endDate) } }
        ],
      },
    });

    const startDateConflict = await Booking.findOne({
      where: {
        [Op.or]: [
          {endDate: { [Op.eq]: new Date(startDate) } },
          {startDate: { [Op.eq]: new Date(startDate) } }
        ],
      },
    });

    const startBetweenConflict = await Booking.findOne({
      where: {
        [Op.or]: [
          { endDate: { [Op.between]: [startDate, endDate] } }
        ],
      },
    });

    const endBetweenConflict = await Booking.findOne({
      where: {
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } }
        ],
      },
    });

    const around = await Booking.findOne({
      where: {
        [Op.and]: [
          {startDate: { [Op.lt]: startDate}},
          {endDate: { [Op.gt]: endDate}}
        ],
      },
    })

    if(endDateConflict && startDateConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking"
          }
        });
    }

    if (endDateConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            endDate: "End date conflicts with an existing booking"
          }
        });
    }

    if (startDateConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            startDate: "Start date conflicts with an existing booking"
          }
        });
    }

    if(endBetweenConflict && startBetweenConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking"
          }
        });
    }

    if (endBetweenConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            endDate: "End date conflicts with an existing booking"
          }
        });
    }

    if (startBetweenConflict) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            startDate: "Start date conflicts with an existing booking"
          }
        });
    }

    if(new Date(startDate) >= new Date(endDate)) {
      return res.status(404).json(
      {
        message: "Bad Request",
        errors: {
          endDate: "endDate cannot be on or before startDate"
        }
      });
    }

    if (around) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking"
          }
        });
    }

    const currentDate = new Date();

    if(new Date(startDate) < currentDate) {
      return res.status(404).json(
        {
          message: "Bad Request",
          errors: {
            endDate: "startDate cannot be in the past"
          }
        });
    }

    const newBooking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    res.status(200).json(newBooking);

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = err.message;
      });
      return res.status(400).json({
        message: 'Bad Request',
        errors,
      });
    }

    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/spots', async (req, res) => {
  try {


  } catch (error) {
    console.error('Error retrieving spots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
