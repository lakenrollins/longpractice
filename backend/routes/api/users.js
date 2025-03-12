const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

// Sign up
router.post('/', async (req, res) => {
  const { email, password, username } = req.body;
  
  // Hash the password
  const hashedPassword = bcrypt.hashSync(password);
  
  // Create a new user
  const user = await User.create({ email, username, hashedPassword });

  // Create a safe user object (without hashedPassword)
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  // Set the JWT cookie
  await setTokenCookie(res, safeUser);

  // Return the user information
  return res.json({
    user: safeUser
  });
});

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    // ... existing signup route handler
  }
);


module.exports = router;