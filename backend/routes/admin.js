const express = require('express');
const { ObjectId, connectMongo } = require('../mongo');
const { verifyToken, verifyRole } = require('./auth');

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const totalUsers = await db.collection('users').countDocuments({ role: 'passenger' });
        const totalTrains = await db.collection('trains').countDocuments({ isActive: true });
        // Count bookings that are not cancelled (covers older docs without status)
        const totalBookings = await db.collection('bookings').countDocuments({ status: { $ne: 'cancelled' } });
        const revenueResult = await db.collection('bookings').aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).toArray();
        const totalRevenue = revenueResult[0]?.total || 0;
        const recentBookings = await db.collection('bookings').aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
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
                    totalAmount: 1,
                    status: 1,
                    bookingDate: 1,
                    user_name: '$user.name',
                    train_number: '$train.trainNumber',
                    train_name: '$train.trainName',
                    source: '$train.source',
                    destination: '$train.destination'
                }
            },
            { $sort: { bookingDate: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Provide counts by status to help debug discrepancies
        const statusAgg = await db.collection('bookings').aggregate([
            { $group: { _id: { $ifNull: ['$status', 'unknown'] }, count: { $sum: 1 } } }
        ]).toArray();
        const statusCounts = statusAgg.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        // Helpful derived counts
        const confirmedCount = statusCounts.confirmed || 0;
        const cancelledCount = statusCounts.cancelled || 0;
        const unknownStatusCount = statusCounts.unknown || 0;

        res.json({
            totalUsers,
            totalTrains,
            totalBookings,
            totalRevenue,
            recentBookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get all bookings
router.get('/bookings', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const bookings = await db.collection('bookings').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
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
                    user_name: '$user.name',
                    user_email: '$user.email',
                    train_number: '$train.trainNumber',
                    train_name: '$train.trainName',
                    source: '$train.source',
                    destination: '$train.destination'
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

// Get all trains
router.get('/trains', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const trains = await db.collection('trains').find({}).toArray();
        res.json(trains.map(train => ({
            id: train._id.toString(),
            train_number: train.trainNumber,
            train_name: train.trainName,
            source: train.source,
            destination: train.destination,
            journey_date: train.journeyDate,
            departure_time: train.departureTime,
            arrival_time: train.arrivalTime,
            price: train.price,
            available_seats: train.availableSeats,
            total_seats: train.totalSeats,
            is_active: train.isActive
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch trains' });
    }
});

// Get station list for admin train creation
router.get('/stations', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const trains = await db.collection('trains').find({}).toArray();
        const sources = [...new Set(trains.map(train => train.source))];
        const destinations = [...new Set(trains.map(train => train.destination))];
        res.json({ sources, destinations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

// Add train
router.post('/trains', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { trainNumber, trainName, source, destination, journeyDate, departureTime, arrivalTime, price, totalSeats } = req.body;
        const db = await connectMongo();
        const result = await db.collection('trains').insertOne({
            trainNumber,
            trainName,
            source,
            destination,
            journeyDate,
            departureTime,
            arrivalTime,
            price: Number(price),
            totalSeats: Number(totalSeats),
            availableSeats: Number(totalSeats),
            isActive: true,
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Train added', id: result.insertedId.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add train' });
    }
});

// Update train
router.put('/trains/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { trainNumber, trainName, source, destination, journeyDate, departureTime, arrivalTime, price, totalSeats } = req.body;
        const db = await connectMongo();

        const existingTrain = await db.collection('trains').findOne({ _id: new ObjectId(req.params.id) });
        if (!existingTrain) {
            return res.status(404).json({ error: 'Train not found' });
        }

        const newTotalSeats = Number(totalSeats);
        const seatDiff = newTotalSeats - (existingTrain.totalSeats || 0);
        const updatedAvailableSeats = Math.max(0, (existingTrain.availableSeats || 0) + seatDiff);

        const updateDoc = {
            trainNumber,
            trainName,
            source,
            destination,
            journeyDate,
            departureTime,
            arrivalTime,
            price: Number(price),
            totalSeats: newTotalSeats,
            availableSeats: updatedAvailableSeats
        };

        const result = await db.collection('trains').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateDoc }
        );

        if (!result.matchedCount) {
            return res.status(404).json({ error: 'Train not found' });
        }

        res.json({ message: 'Train updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update train' });
    }
});

// Reset all seats for a train (admin)
router.put('/trains/:id/free', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const train = await db.collection('trains').findOne({ _id: new ObjectId(req.params.id) });
        if (!train) {
            return res.status(404).json({ error: 'Train not found' });
        }

        const result = await db.collection('bookings').updateMany(
            { trainId: train._id, status: { $ne: 'cancelled' } },
            { $set: { status: 'cancelled' } }
        );

        await db.collection('trains').updateOne(
            { _id: train._id },
            { $set: { availableSeats: train.totalSeats || 0 } }
        );

        res.json({ message: 'All seats freed', cancelledBookings: result.modifiedCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to free seats' });
    }
});

// Get all users
router.get('/users', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const db = await connectMongo();
        const users = await db.collection('users')
            .find({}, { projection: { name: 1, email: 1, phone: 1, role: 1, createdAt: 1 } })
            .toArray();

        res.json(users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            role: user.role,
            created_at: user.createdAt
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;