const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Spot, User, SpotImage, Review } = require('../../db/models/');

const router = express.Router();

router.get('/current', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const ownedReviews = await Review.findAll({
            where: { userId: userId }
        });

        res.json(ownedReviews);
    } catch (error) {
        console.error('Error retrieving owned reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:spotId/reviews', requireAuth, async (req, res) => {
    try {
        const spotId = req.params.spotId;

        const ownedReviews = await Review.findAll({
            where: { spotId: spotId }
        });

        res.json(ownedReviews);
    } catch (error) {
        console.error('Error retrieving owned reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});






module.exports = router;
