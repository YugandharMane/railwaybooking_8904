import express from 'express';
import cors from 'cors';
import dns from 'dns';
import dotenv from 'dotenv';
// Prefer IPv4 results first to avoid SRV lookup IPv6 issues on some networks
dns.setDefaultResultOrder('ipv4first');
import connectDB from './config/database.js';
import { signup, login, getProfile } from './routes/auth.js';
import { protect } from './middlewares/auth.js';
import { getAllTrains, searchTrains, getTrainById } from './routes/trains.js';
import { createBooking, getUserBookings, getBookingById, cancelBooking } from './routes/bookings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Railway Booking API',
    version: '1.0.0',
    status: 'running',
  });
});

// Auth Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', protect, getProfile);

// Train Routes
app.get('/api/trains', getAllTrains);
app.get('/api/trains/search', searchTrains);
app.get('/api/trains/:id', getTrainById);

// Booking Routes
app.post('/api/bookings', protect, createBooking);
app.get('/api/bookings', protect, getUserBookings);
app.get('/api/bookings/:id', protect, getBookingById);
app.put('/api/bookings/:id/cancel', protect, cancelBooking);
// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Railway Booking API Server Running    ║
║  Port: ${PORT}                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}             ║
║  MongoDB: Connected                    ║
╚════════════════════════════════════════╝
  `);
});

export default app;
