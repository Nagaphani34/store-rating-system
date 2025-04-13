require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

async function checkUser() {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['nagaphani@gmail.com']
    );
    
    if (result.rows.length > 0) {
      console.log('User found:', result.rows[0]);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error checking user:', err);
  } finally {
    pool.end();
  }
}

checkUser(); 