// Auth routes
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'patient' } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    const token = jwt.sign({ id: result.insertId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.insertId, name, email, role } });
  } catch (e) { res.status(400).json({ error: 'Email already exists' }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows[0] || !await bcrypt.compare(password, rows[0].password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const user = rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
