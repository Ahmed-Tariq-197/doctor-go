const router = require('express').Router();
router.post('/mock', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), appointmentId: req.body.appointmentId, amount: req.body.amount, receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`, paidAt: new Date() }});
});
module.exports = router;
