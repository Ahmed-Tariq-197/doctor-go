// Doctors routes
const router = require('express').Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { specialty, name } = req.query;
  let sql = `SELECT d.*, u.name, u.email, c.name as clinicName, c.address as clinicAddress, c.lat, c.lng,
    (SELECT COUNT(*) FROM queue q WHERE q.doctor_id = d.id AND q.status = 'waiting') as queueLength
    FROM doctors d JOIN users u ON d.user_id = u.id LEFT JOIN clinics c ON d.clinic_id = c.id WHERE 1=1`;
  const params = [];
  if (specialty) { sql += ' AND d.specialty LIKE ?'; params.push(`%${specialty}%`); }
  if (name) { sql += ' AND u.name LIKE ?'; params.push(`%${name}%`); }
  const [rows] = await pool.execute(sql, params);
  res.json({ success: true, data: rows });
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT d.*, u.name, u.email, c.name as clinicName, c.address as clinicAddress, c.lat, c.lng,
    (SELECT COUNT(*) FROM queue q WHERE q.doctor_id = d.id AND q.status = 'waiting') as queueLength
    FROM doctors d JOIN users u ON d.user_id = u.id LEFT JOIN clinics c ON d.clinic_id = c.id WHERE d.id = ?`,
    [req.params.id]
  );
  rows[0] ? res.json({ success: true, data: rows[0] }) : res.status(404).json({ error: 'Not found' });
});

module.exports = router;
