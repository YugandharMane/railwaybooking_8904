# Railway Booking Backend

A complete backend API for railway reservation system built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication (Signup & Login)
- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authorization
- ✅ MongoDB integration
- ✅ Dummy data seeding
- ✅ CORS enabled
- ✅ Error handling middleware

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

## Installation

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file** (or copy from .env.example)
```bash
cp .env.example .env
```

4. **Update .env with your MongoDB URI**
```env
MONGODB_URI=mongodb+srv://yugandhar:Yug@5731@railwaybooking.4k9vfdz.mongodb.net/?appName=railwaybooking
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
```

## Setup & Running

### 1. Seed Database with Dummy Data
```bash
npm run seed
```

This will:
- Create 4 dummy users
- Create 8 dummy trains
- Hash all passwords automatically

**Test Credentials:**
- Email: `yugandhar@example.com`
- Password: `password123`

### 2. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 3. Start Production Server
```bash
npm start
```

## API Endpoints

### Authentication

#### **Signup**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "age": 25,
  "gender": "Male",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "email": "john@example.com",
    ...
  }
}
```

#### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "yugandhar@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "yugandhar@example.com",
    ...
  }
}
```

#### **Get Profile** (Protected Route)
```http
GET /api/auth/profile
Authorization: Bearer <your_token>
```

## Database Structure

### User Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  age: Number,
  gender: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Train Collection
```javascript
{
  trainNumber: String,
  trainName: String,
  source: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  duration: String,
  distance: String,
  availableSeats: Number,
  totalSeats: Number,
  price: Number,
  type: String,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration

In your React app, configure axios with the backend URL:

```javascript
const API_URL = 'http://localhost:5000/api';

// Signup
await axios.post(`${API_URL}/auth/signup`, userData);

// Login
const response = await axios.post(`${API_URL}/auth/login`, credentials);
localStorage.setItem('token', response.data.token);

// Protected requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
await axios.get(`${API_URL}/auth/profile`);
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Train.js
│   │   └── Booking.js
│   ├── routes/
│   │   └── auth.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── utils/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── index.js
├── scripts/
│   └── seedData.js
├── .env.example
├── package.json
└── README.md
```

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Implement rate limiting for API routes
- Add input validation for all endpoints

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Add train search/filter endpoints
- Implement booking system
- Add payment integration
- Implement email notifications
- Add user profile update endpoint
- Add password reset functionality
- Implement refresh token mechanism

## License

MIT
