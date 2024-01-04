const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const { restoreUser } = require("../../utils/auth.js");

router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.get('/current-user', (req, res) => {
  if (requireAuth(req)) {
    res.status(200).json({
      user: {
        id: req.user.id,
        firstName: req.user.lastname,
        lastname: req.user.lastname,
        email: req.user.email,
        username: req.user.username
      }
    });
  } else {
    res.status(200).json({
      user: null
    });
  }
});

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
