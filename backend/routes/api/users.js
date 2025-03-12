const express = require('express');
const router = express.Router();

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


module.exports = router;