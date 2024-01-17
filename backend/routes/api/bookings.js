const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review, Booking } = require('../../db/models/');


const router = express.Router();

router.get('/current', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;

      const userBookings = await Booking.findAll({
        attributes: ['id', 'spotId', 'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt', ],
        where: { userId: userId },
        include: {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price' ],
          include: {
            model: SpotImage,
            attributes: ['url'],
          },
        },
      });

      const response = userBookings.map((e) => ({
        id: e.id,
        spotId: e.spotId,
        Spot: {
          id: e.Spot.id,
          ownerId: e.Spot.ownerId,
          address: e.Spot.address,
          city: e.Spot.city,
          state: e.Spot.state,
          country: e.Spot.country,
          lat: parseInt(e.Spot.lat),
          lng: parseInt(e.Spot.lng),
          name: e.Spot.name,
          price: e.Spot.price,
          previewImage: e.Spot.SpotImages ? e.Spot.SpotImages[0].url : null
        },
        userId: e.userId,
        startDate: e.startDate,
        endDate: e.endDate,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }));

      res.status(200).json({ Bookings: response });

    } catch (error) {
      console.error('Error retrieving user bookings:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/:bookingId', requireAuth, async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user.id;
      const { startDate, endDate } = req.body;

      const booking = await Booking.findOne({
        where: { id: bookingId },
        include: [
          {
            model: Spot,
            attributes: ['ownerId'],
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden'});
      }

      if (new Date() > new Date(booking.endDate)) {
        return res.status(403).json({ message: "Past bookings can't be modified" });
      }

      const exclude = {
        [Op.not]: [
          { id: bookingId }
        ]
      };

      const endDateConflict = await Booking.findOne({
        where: {
          [Op.and]: [
            { ...exclude },
            {
              [Op.or]: [
                {endDate: { [Op.eq]: new Date(endDate) } },
                {startDate: { [Op.eq]: new Date(endDate) } }
              ],
            }
          ]
        },
      });

      const startDateConflict = await Booking.findOne({
        where: {
          [Op.and]: [
            { ...exclude },
            {
              [Op.or]: [
                {endDate: { [Op.eq]: new Date(startDate) } },
                {startDate: { [Op.eq]: new Date(startDate) } }
              ],
            }
          ]
        },
      });

      const startBetweenConflict = await Booking.findOne({
        where: {
          [Op.and]: [
            { ...exclude },
            {
              [Op.or]: [
                { endDate: { [Op.between]: [startDate, endDate] } }
              ],
            }
          ]
        },
      });

      const endBetweenConflict = await Booking.findOne({
        where: {
          [Op.and]: [
            { ...exclude },
            {
              [Op.or]: [
                { startDate: { [Op.between]: [startDate, endDate] } }
              ],
            }
          ]
        },
      });

      const around = await Booking.findOne({
        where: {
          [Op.and]: [
            { ...exclude },
            {
              [Op.and]: [
                {startDate: { [Op.lt]: startDate}},
                {endDate: { [Op.gt]: endDate}}
              ],
            }
          ]
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

      await Booking.update(
        {
          startDate,
          endDate,
        },
        {
          where: { id: bookingId },
        }
      );

      const updatedBooking = await Booking.findOne({
        where: { id: bookingId },
      });

      res.status(200).json(updatedBooking);

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

      console.error('Error editing booking:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.delete('/:bookingId', requireAuth, async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user.id;

      const booking = await Booking.findOne({
        where: { id: bookingId },
        include: [
          {
            model: Spot,
            attributes: ['ownerId'],
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking couldn't be found" });
      }

      if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (new Date() >= new Date(booking.startDate)) {
        return res.status(403).json({ message: "Bookings that have been started can't be deleted" });
      }

      await Booking.destroy({
        where: { id: bookingId },
      });

      res.status(200).json({ message: 'Successfully deleted' });

    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;
