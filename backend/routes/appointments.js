// Appointments routes
const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const VALID_STATUSES = ['scheduled', 'in-progress', 'completed', 'cancelled'];

// Create appointment
router.post('/', auth, async (req, res, next) => {
  try {
    const { doctorId, appointmentTime } = req.body;
    if (!doctorId || !appointmentTime) {
      return res.status(400).json({ error: 'doctorId and appointmentTime are required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_time) VALUES (?, ?, ?)',
      [req.user.id, doctorId, appointmentTime]
    );
    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
});

// Get appointments for authenticated user
router.get('/', auth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, u.name as patientName, doc_u.name as doctorName FROM appointments a 
       JOIN users u ON a.patient_id = u.id JOIN doctors d ON a.doctor_id = d.id 
       JOIN users doc_u ON d.user_id = doc_u.id WHERE a.patient_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
});

// Update appointment status — with ownership check
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    // Validate status input
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verify ownership: fetch appointment
    const [appointments] = await pool.execute(
      'SELECT patient_id, doctor_id FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointments[0]) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Check if user is the patient
    const isPatient = appointment.patient_id === req.user.id;

    // Check if user is the doctor
    const [doctors] = await pool.execute(
      'SELECT user_id FROM doctors WHERE id = ?',
      [appointment.doctor_id]
    );
    const isDoctor = doctors[0]?.user_id === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ error: 'Unauthorized to modify this appointment' });
    }

    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, appointmentId]
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
