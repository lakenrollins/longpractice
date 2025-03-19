const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
// backend/routes/api/index.js
const express = require('express');
const sessionRouter = require('./session');
const usersRouter = require('./users');
const spotsRouter = require('./spots');
const reviewsRouter = require('./reviews');
const { restoreUser } = require('../../utils/auth');

// Apply restoreUser middleware to set req.user
router.use(restoreUser);

// Connect all router modules
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/reviews', reviewsRouter);


router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
  });

  const { setTokenCookie } = require('../../utils/auth.js');
  const { User } = require('../../db/models');
  router.get('/set-token-cookie', async (_req, res) => {
    const user = await User.findOne({
      where: {
        username: 'Demo-lition'
      }
    });
    setTokenCookie(res, user);
    return res.json({ user: user });
  });
  
  // GET /api/restore-user
  const { restoreUser } = require('../../utils/auth.js');
  
  router.use(restoreUser);
  
  router.get(
    '/restore-user',
    (req, res) => {
      return res.json(req.user);
    }
  );
  
  // GET /api/require-auth
  const { requireAuth } = require('../../utils/auth.js');
  router.get(
    '/require-auth',
    requireAuth,
    (req, res) => {
      return res.json(req.user);
    }
  );

  router.use('/session', sessionRouter);
  router.use('/users', usersRouter);
  
  router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
  });
  
module.exports = router;