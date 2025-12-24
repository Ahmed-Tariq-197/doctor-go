const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const [result] = await pool.execute('INSERT INTO queue (patient_id, doctor_id) VALUES (?, ?)', [req.user.id, req.body.doctorId]);
  res.json({ success: true, data: { id: result.insertId } });
});

router.get('/', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT q.*, u.name as patientName FROM queue q JOIN users u ON q.patient_id = u.id WHERE q.doctor_id = ? AND q.status = 'waiting' ORDER BY q.joined_at`,
    [req.query.doctorId]
  );
  res.json({ success: true, data: rows });
});

module.exports = router;
