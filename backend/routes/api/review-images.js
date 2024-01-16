const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review, Booking, ReviewImage } = require('../../db/models/');


const router = express.Router();


router.delete('/:reviewImageId', requireAuth, async (req, res) => {
    try {
      const reviewImageId = req.params.reviewImageId;

      const reviewImage = await ReviewImage.findOne({
        attributes: ['reviewId'],
        where: {
          id: reviewImageId
        }
      });

      if (!reviewImage) {
        return res.status(404).json({ message: 'Review Image couldn\'t be found' });
      }

      const review = await Review.findOne({
        where: { id: reviewImage.reviewId }
      });

      const authorized = review.userId === req.user.id;

      if (reviewImage && authorized) {
        await ReviewImage.destroy({
          where: { id: reviewImageId },
        });
      }

      if(reviewImage && !authorized) {
        return res.status(404).json({message: 'Forbidden'})
      }

      res.status(200).json({ message: 'Successfully deleted' });

    } catch (error) {
      console.error('Error deleting review image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;
