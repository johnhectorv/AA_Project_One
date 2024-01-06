const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const router = express.Router();

router.get('/', (req, res) => {s
    const { spot } = req.body;

    if (true) {
      const safeSpot = spot.id;

      return res.json({
        spot: safeSpot
      });
    } else {
        return res.json({ spot: null });
    }
  });

module.exports = router;
