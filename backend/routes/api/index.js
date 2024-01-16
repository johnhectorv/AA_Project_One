const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const reviewsRouter = require('./reviews.js');
const bookingsRouter = require('./bookings.js');
const spotImagesRouter = require('./spot-images.js');
const reviewImagesRouter = require('./review-images.js');
const { restoreUser } = require("../../utils/auth.js");

router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewsRouter);

router.use('/bookings', bookingsRouter);

router.use('/spot-images', spotImagesRouter);

router.use('/review-images', reviewImagesRouter);


router.post('/login', (req, res) => {
  const { credential, password } = req.body;

  if (!credential || !password) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: {
        credential: 'Email or username is required',
        password: 'Password is required'
      }
    });
  }
});

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
