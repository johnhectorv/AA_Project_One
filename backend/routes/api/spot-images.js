const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review, Booking } = require('../../db/models/');

const router = express.Router();


router.delete('/:spotImageId', requireAuth, async (req, res) => {
    try {
      const spotImageId = req.params.spotImageId;

      const spotImage = await SpotImage.findOne({
        attributes: ['spotId'],
        where: {
          id: spotImageId
        }
      });

      if (!spotImage) {
        return res.status(404).json({message: 'Spot Image couldn\'t be found'})
      }

      const spot = await Spot.findOne({
        where: { id: spotImage.spotId }
      });

      const authorized = spot.ownerId === req.user.id;

      if (spotImage && authorized) {
        await SpotImage.destroy({
          where: { id:spotImageId }
        });
      }

      if (spotImage && !authorized) {
        return res.status(404).json({message: 'Forbidden'})
      }

      res.status(200).json({ message: 'Successfully deleted' });

    } catch (error) {
      console.error('Error deleting spot image:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;
