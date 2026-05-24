const express = require('express');
const { ObjectId, connectMongo } = require('../mongo');

const router = express.Router();

// Get all trains or search by source/destination/journeyDate
router.get('/', async (req, res) => {
  try {
    const db = await connectMongo();
    const { source, destination, journeyDate } = req.query;
    const filter = { isActive: true };

    if (source) filter.source = source;
    if (destination) filter.destination = destination;
    if (journeyDate) filter.journeyDate = journeyDate;

    const trains = await db.collection('trains').find(filter).toArray();
    res.json(trains.map(train => ({
      id: train._id.toString(),
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      source: train.source,
      destination: train.destination,
      journeyDate: train.journeyDate,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      classes: train.classes || [],
      price: train.price,
      availableSeats: train.availableSeats,
      totalSeats: train.totalSeats,
      isActive: train.isActive
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trains' });
  }
});

// Get list of unique stations
router.get('/stations/list', async (req, res) => {
  try {
    const db = await connectMongo();
    const trains = await db.collection('trains').find({}, { projection: { source: 1, destination: 1 } }).toArray();
    const sources = [...new Set(trains.map(train => train.source))];
    const destinations = [...new Set(trains.map(train => train.destination))];
    res.json({ sources, destinations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Get train details by id
router.get('/:id', async (req, res) => {
  try {
    const db = await connectMongo();
    const train = await db.collection('trains').findOne({ _id: new ObjectId(req.params.id) });

    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }

    res.json({
      id: train._id.toString(),
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      source: train.source,
      destination: train.destination,
      journeyDate: train.journeyDate,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      classes: train.classes || [],
      price: train.price,
      availableSeats: train.availableSeats,
      totalSeats: train.totalSeats,
      isActive: train.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch train details' });
  }
});

module.exports = router;
