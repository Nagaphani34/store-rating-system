const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');
const { storeValidationRules, validate } = require('../middleware/validation');

// Get all stores
router.get('/', auth, async (req, res) => {
  try {
    const { name, address, sort = 'name', order = 'asc' } = req.query;
    
    let query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    
    const params = [];
    let paramCount = 1;
    let whereClause = '';

    if (name) {
      whereClause += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }

    if (address) {
      whereClause += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
      paramCount++;
    }

    if (whereClause) {
      query += ' WHERE 1=1' + whereClause;
    }

    query += ' GROUP BY s.id';
    query += ` ORDER BY ${sort} ${order}`;

    const stores = await db.query(query, params);
    res.json(stores.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const store = await db.query(
      `SELECT s.*, 
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [req.params.id]
    );

    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new store (admin only)
router.post('/', auth, checkRole(['admin']), storeValidationRules(), validate, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if store exists
    const storeExists = await db.query(
      'SELECT * FROM stores WHERE email = $1',
      [email]
    );

    if (storeExists.rows.length > 0) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    // Create store
    const newStore = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, owner_id]
    );

    res.status(201).json(newStore.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store ratings (store owner only)
router.get('/:id/ratings', auth, async (req, res) => {
  try {
    // Check if user is store owner
    const store = await db.query(
      'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );

    if (store.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const ratings = await db.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json(ratings.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 