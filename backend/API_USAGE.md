# API Usage Examples

This file contains examples of how to use the Railway Booking API.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. User Authentication

### Signup (Register New User)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePass123",
    "age": 28,
    "gender": "Male",
    "address": "123 Main Street, Mumbai"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "age": 28,
    "gender": "Male",
    "address": "123 Main Street, Mumbai",
    "createdAt": "2024-05-19T10:30:00.000Z"
  }
}
```

---

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yugandhar@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "firstName": "Yugandhar",
    "lastName": "User1",
    "email": "yugandhar@example.com",
    "phone": "9876543210"
  }
}
```

---

### Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "firstName": "Yugandhar",
    "lastName": "User1",
    "email": "yugandhar@example.com",
    "phone": "9876543210",
    "age": 28,
    "gender": "Male",
    "address": "123 Railway St, Mumbai",
    "createdAt": "2024-05-19T10:00:00.000Z",
    "updatedAt": "2024-05-19T10:00:00.000Z"
  }
}
```

---

## 2. Train Management

### Get All Trains
```bash
curl -X GET http://localhost:5000/api/trains
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "trainNumber": "12001",
      "trainName": "Rajdhani Express",
      "source": "Mumbai",
      "destination": "Delhi",
      "departureTime": "08:00 AM",
      "arrivalTime": "08:00 PM",
      "duration": "12h 0m",
      "distance": "1447 km",
      "availableSeats": 45,
      "totalSeats": 500,
      "price": 2500,
      "type": "Express",
      "rating": 4.8
    },
    ...
  ]
}
```

---

### Search Trains
```bash
curl -X GET "http://localhost:5000/api/trains/search?source=Mumbai&destination=Delhi"
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "trainNumber": "12001",
      "trainName": "Rajdhani Express",
      "source": "Mumbai",
      "destination": "Delhi",
      "availableSeats": 45,
      "price": 2500,
      ...
    }
  ]
}
```

---

### Get Train by ID
```bash
curl -X GET http://localhost:5000/api/trains/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "trainNumber": "12001",
    "trainName": "Rajdhani Express",
    "source": "Mumbai",
    "destination": "Delhi",
    "departureTime": "08:00 AM",
    "arrivalTime": "08:00 PM",
    "duration": "12h 0m",
    "distance": "1447 km",
    "availableSeats": 45,
    "totalSeats": 500,
    "price": 2500,
    "type": "Express",
    "rating": 4.8
  }
}
```

---

## 3. Bookings

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "trainId": "507f1f77bcf86cd799439012",
    "totalPrice": 5000,
    "passengers": [
      {
        "name": "John Doe",
        "age": 28,
        "gender": "Male",
        "seatNumber": "A1"
      },
      {
        "name": "Jane Doe",
        "age": 26,
        "gender": "Female",
        "seatNumber": "A2"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439010",
    "trainId": "507f1f77bcf86cd799439012",
    "passengers": [
      {
        "name": "John Doe",
        "age": 28,
        "gender": "Male",
        "seatNumber": "A1"
      },
      {
        "name": "Jane Doe",
        "age": 26,
        "gender": "Female",
        "seatNumber": "A2"
      }
    ],
    "totalPrice": 5000,
    "bookingStatus": "Confirmed",
    "paymentStatus": "Paid",
    "bookingDate": "2024-05-19T10:30:00.000Z"
  }
}
```

---

### Get User Bookings
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439010",
      "trainId": {
        "_id": "507f1f77bcf86cd799439012",
        "trainName": "Rajdhani Express",
        "source": "Mumbai",
        "destination": "Delhi"
      },
      "passengers": [...],
      "totalPrice": 5000,
      "bookingStatus": "Confirmed"
    }
  ]
}
```

---

### Get Booking by ID
```bash
curl -X GET http://localhost:5000/api/bookings/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439010",
    "trainId": {...},
    "passengers": [...],
    "totalPrice": 5000,
    "bookingStatus": "Confirmed",
    "paymentStatus": "Paid"
  }
}
```

---

### Cancel Booking
```bash
curl -X PUT http://localhost:5000/api/bookings/507f1f77bcf86cd799439020/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "bookingStatus": "Cancelled",
    ...
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Train not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Testing with JavaScript/Fetch

### Signup
```javascript
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '9876543210',
    password: 'SecurePass123',
    age: 28,
    gender: 'Male',
  }),
});

const data = await response.json();
console.log(data);
```

### Login
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'yugandhar@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.token);
  console.log('Login successful:', data.user);
}
```

### Protected Request (with token)
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.user);
```

---

## Testing with Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Signup
const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '9876543210',
  password: 'SecurePass123',
  age: 28,
  gender: 'Male',
});

const token = signupResponse.data.token;

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Get profile
const profileResponse = await axios.get(`${API_URL}/auth/profile`);
console.log(profileResponse.data.user);

// Search trains
const trainsResponse = await axios.get(`${API_URL}/trains/search`, {
  params: {
    source: 'Mumbai',
    destination: 'Delhi',
  },
});

// Create booking
const bookingResponse = await axios.post(`${API_URL}/bookings`, {
  trainId: '507f1f77bcf86cd799439012',
  totalPrice: 5000,
  passengers: [
    {
      name: 'John Doe',
      age: 28,
      gender: 'Male',
      seatNumber: 'A1',
    },
  ],
});
```

---

## Dummy Test Credentials

Use these credentials after running `npm run seed`:

- **Email:** `yugandhar@example.com`
- **Password:** `password123`

Available trains after seeding: 8 trains with various routes and prices.
