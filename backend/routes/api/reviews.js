const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, ReviewImage, SpotImage, Review } = require('../../db/models/');

const router = express.Router();

router.get('/current', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const ownedReviews = await Review.findAll({
          where: { userId: userId },
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName'],
            },
            {
              model: Spot,
              attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
              include: [
                {
                  model: SpotImage,
                  attributes: ['url'],
                }
              ]
            },
            {
              model: ReviewImage,
              attributes: ['id', 'url'],
            }
          ]
        });


        res.json(
          {
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
            Spot: {
              id: e.Spot.id,
              ownerId: e.Spot.ownerId,
              address: e.Spot.address,
              city: e.Spot.city,
              state: e.Spot.state,
              country: e.Spot.country,
              lat: e.Spot.lat,
              lng: parseInt(e.Spot.lng),
              name: parseInt(e.Spot.name),
              price: e.Spot.price,
              previewImage: e.Spot.SpotImages ? e.Spot.SpotImages[0].url : null
            },
            ReviewImages: e.ReviewImages.map(image => ({
              id: image.id,
              url: image.url
            }))
          }))
          }
        );

    } catch (error) {
        console.error('Error retrieving owned reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:reviewId/images', requireAuth, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { url } = req.body;
        const ownerId = req.user.id;

        const review = await Review.findOne({
            where: { id: reviewId }
        });

        if(!review) {
            return res.status(404).json({message: 'Review couldn\'t be found'})
        }

        if (!(review.userId === req.user.id)) {
            return res.status(404).json({message: 'Forbidden'})
        };

        const reviews = await ReviewImage.findAll({
            where: { reviewId: review.id }
        })

        let newImage;

        if(reviews.length < 10) {
            newImage = await ReviewImage.create({
                reviewId,
                url,
            });
        } else {
            return res.status(403).json({message: 'Maximum number of images for this resource was reached'})
        }

        res.status(200).json({ id: newImage.id, url: newImage.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:reviewId', requireAuth, async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
      const { review, stars } = req.body;

      const currReview = await Review.findOne({
        where: {
          id: reviewId
        }
      });

      if (!currReview) {
        return res.status(404).json({ message: 'Review couldn\'t be found' });
      }

      const authorized = currReview.userId === req.user.id;

      if (!authorized) {
        return res.status(404).json({message: 'Forbidden'})
      };

      if (!review || !stars || stars < 1 || stars > 5) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: {
            review: 'Review text is required',
            stars: 'Stars must be an integer from 1 to 5',
          },
        });
      }

      await Review.update(
        {
          review: review,
          stars: stars,
        },
        {
          where: { id: reviewId },
        }
      );

      res.status(200).json({
        id: currReview.id,
        userId: currReview.userId,
        spotId: currReview.spotId,
        review: review,
        stars: stars,
        createdAt: currReview.createdAt,
        updatedAt: currReview.updatedAt,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/:reviewId', requireAuth, async (req, res) => {
    try {
      const reviewId = req.params.reviewId;

      const review = await Review.findOne({
        where: { id: reviewId },
      });

      if (!review) {
        return res.status(404).json({message: 'Review couldn\'t be found'})
      }

      const authorized = review.userId === req.user.id;

      if (review && authorized) {
        await Review.destroy({
          where: { id: reviewId },
        });
      }

      if (review && !authorized) {
        return res.status(404).json({message: 'Forbidden'})
      }

      res.status(200).json({ message: 'Successfully deleted' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });






module.exports = router;
