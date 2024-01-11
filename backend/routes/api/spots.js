const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage } = require('../../db/models/');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const allData = await Spot.findAll();
        res.json(allData);
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

        res.json(ownedSpots);
    } catch (error) {
        console.error('Error retrieving owned spots:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const ownerId =  req.user.id;

        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if (!address || !city || !state || !country || lat < -90 || lat > 90 || lng < -180 || lng > 180 || !name || name.length > 50 || !description || price <= 0) {
            return res.status(400).json({
              message: 'Bad Request',
              errors: {
                address: 'Street address is required',
                city: 'City is required',
                state: 'State is required',
                country: 'Country is required',
                lat: 'Latitude must be within -90 and 90',
                lng: 'Longitude must be within -180 and 180',
                name: 'Name must be less than 50 characters',
                description: 'Description is required',
                price: 'Price per day must be a positive number'
              }
            });
          }

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
            return res.status(404).json({message: 'Spot could not be found'})
          }

          //const numReviews =
          //const totalStars =
          //const avgStarRating =

          res.status(200).json(spot);

        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      });

      router.delete('/:spotId', requireAuth, async (req, res) => {
        try{
          const spotId = req.params.spotId;

          const spot = await Spot.findOne({
            where: { id: spotId },
          });

          if (!spot) {
            return res.status(404).json({message: 'Spot could not be found'})
          };

          if (!(spot.ownerId === req.user.id)) {
            return res.status(404).json({message: 'Not Authorized'})
          };

          await Spot.destroy({
            where: { id:spotId }
          });

          res.status(200).json({ message: 'Successfully deleted' });

        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      router.put('/:spotId', requireAuth, async (req, res) => {
        try {
          const spotId = req.params.spotId;
          const { address, city, state, country, lat, lng, name, description, price } = req.body;

          const spot = await Spot.findOne({
            where: { id: spotId },
          });

          if(!spot) {
            return res.status(404).json({
              message: 'Spot could not be found'
            });
          }

          if (!(spot.ownerId === req.user.id)) {
            return res.status(404).json({message: 'Not Authorized'})
          };

          if (!address || !city || !state || !country || lat < -90 || lat > 90 || lng < -180 || lng > 180 || !name || name.length > 50 || !description || price <= 0) {
            return res.status(400).json({
              message: 'Bad Request',
              errors: {
                address: 'Street address is required',
                city: 'City is required',
                state: 'State is required',
                country: 'Country is required',
                lat: 'Latitude must be within -90 and 90',
                lng: 'Longitude must be within -180 and 180',
                name: 'Name must be less than 50 characters',
                description: 'Description is required',
                price: 'Price per day must be a positive number'
              }
            });
          }

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
          const ownerId = req.user.id;

          const spot = await Spot.findOne({ where: { id: spotId } });

          if (!spot) {
            return res.status(404).json({message: 'Spot could not be found'})
          };

          if (!(spot.ownerId === req.user.id)) {
            return res.status(404).json({message: 'Not Authorized'})
          };

          const newImage = await SpotImage.create({
            spotId,
            url,
            preview,
          });

          res.status(200).json({ spotId: newImage.spotId, url: newImage.url, preview: newImage.preview});

        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
      }

      });

module.exports = router;
