const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Join queue (authenticated)
router.post('/', auth, async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId is required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO queue (patient_id, doctor_id) VALUES (?, ?)',
      [req.user.id, doctorId]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
});

// Get queue for a doctor (public read)
router.get('/', async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId query parameter is required' });
    }
    const [rows] = await pool.execute(
      `SELECT q.*, u.name as patientName FROM queue q 
       JOIN users u ON q.patient_id = u.id 
       WHERE q.doctor_id = ? AND q.status = 'waiting' ORDER BY q.joined_at`,
      [doctorId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
