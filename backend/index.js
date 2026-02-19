// ============================================
// DoctorGo Backend - Main Server
// Node.js + Express
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ---- CORS with environment-based config ----
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/recommendation', require('./routes/recommendation'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---- Global error handler ----
// Must be defined AFTER routes, with 4 parameters (err, req, res, next)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Always log full details server-side for debugging
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Never leak stack traces or internal messages to clients in production
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'An unexpected error occurred. Please try again.' : err.message;

  res.status(err.status || 500).json({ error: message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
