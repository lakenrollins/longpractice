const express = require('express');
const { Spot, SpotImage, User, Review, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Spot, Review, User, ReviewImage } = require('../../db/models');
const { validateReview } = require('../../utils/validation');
const { requireAuth } = require('../../middleware/auth');


const router = express.Router();

// Validation middleware
const validateSpot = [
    check('address').notEmpty().withMessage('Address is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('country').notEmpty().withMessage('Country is required'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    check('name').isLength({ max: 50 }).withMessage('Name must be at most 50 characters'),
    check('description').notEmpty().withMessage('Description is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// GET /api/spots (Retrieve all spots with pagination)
router.get('/', async (req, res) => {
    let { page = 1, size = 20 } = req.query;
    page = parseInt(page);
    size = parseInt(size);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(size) || size < 1 || size > 100) size = 20;

    const limit = size;
    const offset = (page - 1) * size;

    const spots = await Spot.findAll({
        limit,
        offset,
        include: [{ model: SpotImage }, { model: User, as: 'Owner' }]
    });

    res.json({ spots, page, size });
});

// GET /api/spots/current (Retrieve current user's spots)
router.get('/current', requireAuth, async (req, res) => {
    const spots = await Spot.findAll({
        where: { ownerId: req.user.id }
    });
    res.json({ spots });
});

// GET /api/spots/:id (Retrieve a specific spot by ID)
router.get('/:id', async (req, res) => {
    const spot = await Spot.findByPk(req.params.id, {
        include: [{ model: SpotImage }, { model: User, as: 'Owner' }]
    });
    if (!spot) return res.status(404).json({ message: 'Spot not found' });
    res.json(spot);
});

// POST /api/spots (Create a new spot)
router.post('/', requireAuth, validateSpot, async (req, res) => {
    const newSpot = await Spot.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(newSpot);
});

// POST /api/spots/:id/images (Add an image to a spot)
router.post('/api/spots/:id/images', requireAuth, async (req, res) => {
    const { id: spotId } = req.params;
    const { url, preview } = req.body;
    
    try {
        // Find spot by ID
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Check if the current user is the owner of the spot
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Create new SpotImage
        const newImage = await SpotImage.create({ spotId, url, preview });

        // Format response
        const response = {
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        };

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// PUT /api/spots/:id - Edit a Spot
router.put('/:id', requireAuth, validateSpot, async (req, res) => {
    const { id } = req.params;  // Extract spotId from URL params
    const { address, city, state, country, lat, lng, name, description, price } = req.body;  // Extract data from body

    try {
        // Find the spot by ID
        const spot = await Spot.findByPk(id);

        // Check if spot exists
        if (!spot) {
            return res.status(404).json({ message: 'Spot not found' });
        }

        // Check if the current user is the owner of the spot
        if (spot.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Update the spot with the new data
        spot.address = address;
        spot.city = city;
        spot.state = state;
        spot.country = country;
        spot.lat = lat;
        spot.lng = lng;
        spot.name = name;
        spot.description = description;
        spot.price = price;

        await spot.save();  // Save the updated spot

        // Format and send the response
        return res.status(200).json({
            id: spot.id,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            userId: spot.userId,
        });
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: err.errors });
        } else {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
});


// DELETE /api/spots/:id (Delete a spot)
router.delete('/api/spots/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming the user ID is stored in req.user after authentication

  try {
    // Find the spot by ID
    const spot = await Spot.findByPk(id);

    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete the spot
    await spot.destroy();

    return res.status(200).json({ message: "Spot deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/spots/:spotId/reviews - Get all reviews for a spot
router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findByPk(spotId);
    
    if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const reviews = await Review.findAll({
        where: { spotId },
        include: [
            { model: User, attributes: ['id', 'username'] },
            { model: ReviewImage, attributes: ['id', 'url'] }
        ]
    });

    return res.json({ Reviews: reviews });
});

// POST /api/spots/:spotId/reviews - Create a new review for a spot
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
    const { spotId } = req.params;
    const { user } = req;
    const { review, stars } = req.body;
    
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
    }
    
    const existingReview = await Review.findOne({ where: { spotId, userId: user.id } });
    if (existingReview) {
        return res.status(500).json({ message: "User already has a review for this spot" });
    }
    
    const newReview = await Review.create({
        spotId,
        userId: user.id,
        review,
        stars
    });
    
    return res.status(201).json(newReview);
});




module.exports = router;
