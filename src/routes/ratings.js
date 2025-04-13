const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');
const { ratingValidationRules, validate } = require('../middleware/validation');

// Submit or update rating for a store
router.post('/stores/:storeId', auth, checkRole(['user']), ratingValidationRules(), validate, async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = req.params.storeId;

    // Check if store exists
    const store = await db.query(
      'SELECT * FROM stores WHERE id = $1',
      [storeId]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await db.query(
      'SELECT * FROM ratings WHERE store_id = $1 AND user_id = $2',
      [storeId, req.user.id]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      const updatedRating = await db.query(
        'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE store_id = $2 AND user_id = $3 RETURNING *',
        [rating, storeId, req.user.id]
      );
      return res.json(updatedRating.rows[0]);
    }

    // Create new rating
    const newRating = await db.query(
      'INSERT INTO ratings (store_id, user_id, rating) VALUES ($1, $2, $3) RETURNING *',
      [storeId, req.user.id, rating]
    );

    res.status(201).json(newRating.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rating for a store
router.get('/stores/:storeId', auth, async (req, res) => {
  try {
    const rating = await db.query(
      'SELECT * FROM ratings WHERE store_id = $1 AND user_id = $2',
      [req.params.storeId, req.user.id]
    );

    res.json(rating.rows[0] || { rating: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics (admin only)
router.get('/dashboard', auth, checkRole(['admin']), async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stores) as total_stores,
        (SELECT COUNT(*) FROM ratings) as total_ratings
    `);

    res.json(stats.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 