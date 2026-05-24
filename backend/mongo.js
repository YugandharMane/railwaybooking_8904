require('dotenv').config();
const dns = require('dns');
const { MongoClient, ObjectId } = require('mongodb');

const dnsServers = process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8';
if (dnsServers) {
  dns.setServers(dnsServers.split(',').map(s => s.trim()).filter(Boolean));
}

const username = process.env.MONGO_USER || 'yugandhar';
const password = process.env.MONGO_PASSWORD || 'Yug@5731';
const host = process.env.MONGO_HOST || 'railwaybooking.z8bnmld.mongodb.net';
const dbName = process.env.MONGO_DB || 'railwaybooking';
const options = process.env.MONGO_OPTIONS || 'appName=RailwayBooking&retryWrites=true&w=majority';

const uri = process.env.MONGO_URI ||
  `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/?${options}`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@railwaybooking.com',
    password: 'admin123',
    phone: null,
    role: 'admin',
    createdAt: new Date(),
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'john123',
    phone: '9876543210',
    role: 'passenger',
    createdAt: new Date(),
  },
  {
    name: 'Nil User',
    email: 'nil@example.com',
    password: 'nil123',
    phone: '9000000001',
    role: 'passenger',
    createdAt: new Date(),
  }
];

const trainNumbers = ['12345', '54321', '11007', '12015', '22920', '16026', '12951', '12630'];
const trainNames = ['Gatimaan Express', 'Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Garib Rath', 'Humsafar Express'];
const stations = ['Delhi (NDLS)', 'Mumbai (CSTM)', 'Kolkata (HWH)', 'Bangalore (SBC)', 'Chennai (MAS)', 'Jaipur (JP)', 'Ahmedabad (ADI)', 'Lucknow (LKO)'];
const journeyDates = ['2026-03-15', '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20'];
const departureTimes = ['06:00', '08:30', '11:00', '13:45', '16:20', '19:00'];
const arrivalTimes = ['12:00', '14:30', '17:00', '19:45', '22:20', '01:00'];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear = 2026, endYear = 2026) {
  const [year] = [randomNumber(startYear, endYear)];
  const month = Math.floor(Math.random() * 3) + 3;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day);
}

function createClassOptions() {
  const templates = [
    { name: '1AC', fareMin: 3600, fareMax: 5200, seatsMin: 6, seatsMax: 18 },
    { name: '2AC', fareMin: 2200, fareMax: 3400, seatsMin: 20, seatsMax: 45 },
    { name: '3AC', fareMin: 1500, fareMax: 2200, seatsMin: 30, seatsMax: 60 },
    { name: 'CC', fareMin: 700, fareMax: 950, seatsMin: 50, seatsMax: 90 },
    { name: 'SL', fareMin: 420, fareMax: 620, seatsMin: 80, seatsMax: 140 },
  ];

  return templates.map(template => ({
    name: template.name,
    fare: randomNumber(template.fareMin, template.fareMax),
    availableSeats: randomNumber(template.seatsMin, template.seatsMax),
  }));
}

function createSampleTrain(index = 0) {
  const source = stations[index % stations.length];
  const destination = stations[(index + 2) % stations.length];
  const classes = createClassOptions().slice(0, 3);
  const totalSeats = classes.reduce((sum, item) => sum + item.availableSeats, 0);
  const price = classes[1] ? classes[1].fare : classes[0].fare;

  return {
    trainNumber: trainNumbers[index % trainNumbers.length],
    trainName: trainNames[index % trainNames.length],
    source,
    destination: source === destination ? stations[(index + 3) % stations.length] : destination,
    journeyDate: journeyDates[index % journeyDates.length],
    departureTime: departureTimes[index % departureTimes.length],
    arrivalTime: arrivalTimes[index % arrivalTimes.length],
    classes,
    price,
    totalSeats,
    availableSeats: totalSeats,
    isActive: true,
    createdAt: new Date(),
  };
}

async function ensureInitialUsers(db) {
  const users = db.collection('users');
  await Promise.all(defaultUsers.map(user =>
    users.updateOne(
      { email: user.email },
      { $setOnInsert: user },
      { upsert: true }
    )
  ));
}

async function ensureInitialTrains(db) {
  const trainsCollection = db.collection('trains');
  const trainsCount = await trainsCollection.countDocuments();
  if (trainsCount === 0) {
    const sampleTrains = Array.from({ length: 8 }, (_, index) => createSampleTrain(index));
    await trainsCollection.insertMany(sampleTrains);
    return;
  }

  await trainsCollection.updateMany(
    { availableSeats: { $exists: false } },
    [{ $set: { availableSeats: '$totalSeats' } }]
  );
  await trainsCollection.updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );
}

async function ensureInitialBookings(db) {
  const bookings = db.collection('bookings');
  const count = await bookings.countDocuments();
  if (count > 0) {
    return;
  }

  const users = await db.collection('users').find({}).toArray();
  const trains = await db.collection('trains').find({}).limit(4).toArray();
  if (users.length === 0 || trains.length === 0) {
    return;
  }

  const johnUser = users.find((user) => user.email === 'john@example.com') || users[0];
  const bookingData = [
    {
      bookingId: 'RAILBOOK_SAMPLE_1',
      userId: johnUser._id,
      trainId: trains[0]._id,
      seats: ['A1', 'A2'],
      totalAmount: trains[0].price * 2,
      status: 'confirmed',
      bookingDate: new Date()
    },
    {
      bookingId: 'RAILBOOK_SAMPLE_2',
      userId: johnUser._id,
      trainId: trains[1]._id,
      seats: ['B1', 'B2', 'B3'],
      totalAmount: trains[1].price * 3,
      status: 'confirmed',
      bookingDate: new Date(new Date().getTime() - 86400000)
    }
  ];

  await bookings.insertMany(bookingData);
  await db.collection('trains').updateOne(
    { _id: trains[0]._id },
    { $inc: { availableSeats: -2 } }
  );
  await db.collection('trains').updateOne(
    { _id: trains[1]._id },
    { $inc: { availableSeats: -3 } }
  );
}

async function seedDatabase() {
  // Expose a simple programmatic seeding operation for external scripts
  if (client.closed) {
    await client.connect();
  }
  const db = client.db(dbName);
  await ensureInitialUsers(db);
  await ensureInitialTrains(db);
  await ensureInitialBookings(db);
  return db;
}

async function connectMongo() {
  if (client.closed) {
    await client.connect();
  }
  const db = client.db(dbName);
  await ensureInitialUsers(db);
  await ensureInitialTrains(db);
  return db;
}

async function insertRandomTrains(count = 5) {
  try {
    const db = await connectMongo();
    const collection = db.collection('trains');

    const docs = Array.from({ length: count }, (_, index) => createSampleTrain(index));
    const result = await collection.insertMany(docs);

    console.log(`Inserted ${result.insertedCount} random train entries into ${dbName}.trains`);
    console.log('Inserted IDs:', Object.values(result.insertedIds));
  } catch (error) {
    console.error('MongoDB insert error:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  const count = parseInt(process.argv[2], 10) || 10;
  insertRandomTrains(count).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  connectMongo,
  client,
  ObjectId,
  insertRandomTrains,
  seedDatabase
};
