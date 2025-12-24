const router = require('express').Router();
const pool = require('../db');

const keywords = {
  'General Practice': ['fever', 'cold', 'flu', 'cough', 'headache', 'fatigue', 'checkup'],
  'Cardiology': ['heart', 'chest pain', 'palpitations', 'blood pressure', 'breathing'],
  'Pediatrics': ['child', 'baby', 'infant', 'toddler', 'kids'],
  'Dermatology': ['skin', 'rash', 'acne', 'eczema', 'mole', 'itching'],
  'Orthopedics': ['bone', 'joint', 'muscle', 'back pain', 'knee', 'fracture']
};

router.get('/', async (req, res) => {
  const query = (req.query.query || '').toLowerCase();
  const [doctors] = await pool.execute('SELECT d.*, u.name FROM doctors d JOIN users u ON d.user_id = u.id');
  const results = doctors.map(doc => {
    const kws = keywords[doc.specialty] || [];
    const matched = kws.filter(k => query.includes(k));
    return { ...doc, matchScore: matched.length ? Math.round((matched.length / kws.length) * 100) : 0, reason: matched.join(', ') };
  }).filter(d => d.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore).slice(0, 3);
  res.json({ success: true, data: results });
});

module.exports = router;
