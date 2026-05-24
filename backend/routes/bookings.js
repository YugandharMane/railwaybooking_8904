const express = require('express');
const { ObjectId, connectMongo } = require('../mongo');
const { verifyToken } = require('./auth');

const router = express.Router();

// Generate unique booking ID
function generateBookingId() {
    return 'RAILBOOK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Create booking
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { trainId, seats } = req.body;
        const userId = new ObjectId(req.user.id);
        const db = await connectMongo();

        const train = await db.collection('trains').findOne({ _id: new ObjectId(trainId) });
        if (!train) {
            return res.status(404).json({ error: 'Train not found' });
        }

        const existingBookings = await db.collection('bookings').find({ trainId: train._id, status: 'confirmed' }).toArray();
        const bookedSeats = [];
        existingBookings.forEach(booking => {
            if (Array.isArray(booking.seats)) {
                bookedSeats.push(...booking.seats);
            }
        });

        const conflictingSeats = Array.isArray(seats) ? seats.filter(seat => bookedSeats.includes(seat)) : [];
        if (conflictingSeats.length > 0) {
            return res.status(400).json({ error: `Seats ${conflictingSeats.join(', ')} are already booked` });
        }

        if (!Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ error: 'At least one seat must be selected' });
        }

        if (train.availableSeats < seats.length) {
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        const totalAmount = seats.length * train.price;
        const bookingId = generateBookingId();

        await db.collection('bookings').insertOne({
            bookingId,
            userId,
            trainId: train._id,
            seats,
            totalAmount,
            status: 'confirmed',
            bookingDate: new Date()
        });

        await db.collection('trains').updateOne(
            { _id: train._id },
            { $inc: { availableSeats: -seats.length } }
        );

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId,
            totalAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to create booking' });
    }
});

// Get user bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const db = await connectMongo();
        const userId = new ObjectId(req.user.id);

        const bookings = await db.collection('bookings').aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'trains',
                    localField: 'trainId',
                    foreignField: '_id',
                    as: 'train'
                }
            },
            { $unwind: '$train' },
            {
                $project: {
                    bookingId: 1,
                    seats: 1,
                    totalAmount: 1,
                    status: 1,
                    bookingDate: 1,
                    train_number: '$train.trainNumber',
                    train_name: '$train.trainName',
                    source: '$train.source',
                    destination: '$train.destination',
                    journey_date: '$train.journeyDate',
                    departure_time: '$train.departureTime',
                    arrival_time: '$train.arrivalTime'
                }
            },
            { $sort: { bookingDate: -1 } }
        ]).toArray();

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Cancel booking
router.put('/:bookingId/cancel', verifyToken, async (req, res) => {
    try {
        const db = await connectMongo();
        const userId = new ObjectId(req.user.id);

        const booking = await db.collection('bookings').findOne({ bookingId: req.params.bookingId, userId });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        await db.collection('bookings').updateOne(
            { _id: booking._id },
            { $set: { status: 'cancelled' } }
        );

        await db.collection('trains').updateOne(
            { _id: booking.trainId },
            { $inc: { availableSeats: booking.seats.length } }
        );

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to cancel booking' });
    }
});

module.exports = router;