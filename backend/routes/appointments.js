// Appointments, Queue, Payments, Recommendation routes
const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Appointments
router.post('/', auth, async (req, res) => {
  const { doctorId, appointmentTime } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_time) VALUES (?, ?, ?)',
    [req.user.id, doctorId, appointmentTime]
  );
  res.json({ success: true, data: { id: result.insertId } });
});

router.get('/', auth, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT a.*, u.name as patientName, doc_u.name as doctorName FROM appointments a 
     JOIN users u ON a.patient_id = u.id JOIN doctors d ON a.doctor_id = d.id 
     JOIN users doc_u ON d.user_id = doc_u.id WHERE a.patient_id = ?`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

router.put('/:id', auth, async (req, res) => {
  await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
