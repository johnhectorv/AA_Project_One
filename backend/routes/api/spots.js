const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review, Booking, ReviewImage } = require('../../db/models/');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const allData = await Spot.findAll();
        res.json({Spots: allData});
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'No Data Found' });
    }
});

router.get('/current', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const ownedSpots = await Spot.findAll({
            where: { ownerId: userId }
        });

        res.json({Spots: ownedSpots});
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
      lat: spot.lat,
      lng: spot.lng,
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

    if (spot && authorized) {
      await Spot.destroy({
        where: { id:spotId }
      });
    }

    if (spot && !authorized) {
      return res.status(404).json({message: 'Forbidden'})
    }

    if (!spot) {
      return res.status(404).json({message: 'Spot couldn\'t be found'})
    };

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
      lat: spot.lat,
      lng: spot.lng,
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

router.get('/:spotId/reviews', requireAuth, async (req, res) => {
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
              where: { id: 1 }
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
            { userId: userId },
          ]
        },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });

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
