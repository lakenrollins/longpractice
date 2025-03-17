const express = require('express');
const { Review, ReviewImage, User, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const router = express.Router();

// Validation middleware for reviews
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required.'),
  check('stars')
    .exists()
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// GET /api/reviews/current - Get current user's reviews
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  const reviews = await Review.findAll({
    where: { userId },
    include: [
      { model: User, attributes: ['id', 'firstName', 'lastName'] },
      { 
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
        include: [{ model: SpotImage, attributes: ['url'], where: { preview: true }, required: false }]
      },
      { model: ReviewImage, attributes: ['id', 'url'] }
    ]
  });

  const formattedReviews = reviews.map(review => {
    const reviewJSON = review.toJSON();
    reviewJSON.Spot.previewImage = reviewJSON.Spot.SpotImages.length ? reviewJSON.Spot.SpotImages[0].url : null;
    delete reviewJSON.Spot.SpotImages;
    return reviewJSON;
  });

  res.json({ Reviews: formattedReviews });
});

// POST /api/reviews/:reviewId/images - Add an image to a review
router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }

  if (review.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const imageCount = await ReviewImage.count({ where: { reviewId } });
  if (imageCount >= 10) {
    return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
  }

  const newImage = await ReviewImage.create({ reviewId, url });
  res.status(201).json({ id: newImage.id, url: newImage.url });
});

module.exports = router;
