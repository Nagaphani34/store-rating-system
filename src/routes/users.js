const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');
const { userValidationRules, validate } = require('../middleware/validation');

// Get all users (admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, address, role, sort = 'name', order = 'asc' } = req.query;
    
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (name) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }

    if (email) {
      query += ` AND email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
      paramCount++;
    }

    if (address) {
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    query += ` ORDER BY ${sort} ${order}`;

    const users = await db.query(query, params);
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [req.params.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a store owner, get their store rating
    if (user.rows[0].role === 'store_owner') {
      const storeRating = await db.query(
        `SELECT AVG(rating) as average_rating FROM ratings r 
         JOIN stores s ON r.store_id = s.id 
         WHERE s.owner_id = $1`,
        [req.params.id]
      );
      user.rows[0].average_rating = storeRating.rows[0].average_rating;
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', auth, checkRole(['admin']), userValidationRules(), validate, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    // Validate current password
    const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 