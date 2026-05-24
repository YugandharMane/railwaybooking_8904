# Quick Start Guide

## 🚀 One-Command Setup (Windows)

Open PowerShell or Command Prompt in the backend folder and run:

```bash
.\setup.bat
```

Then:
```bash
npm run seed
npm run dev
```

---

## 🚀 One-Command Setup (macOS/Linux)

```bash
chmod +x setup.sh
./setup.sh

npm run seed
npm run dev
```

---

## ⚙️ Manual Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
```bash
cp .env.example .env
```

The .env file already has your MongoDB URI configured:
```
MONGODB_URI=mongodb+srv://yugandhar:Yug@5731@railwaybooking.4k9vfdz.mongodb.net/?appName=railwaybooking
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=development
```

### Step 3: Seed Database with Dummy Data
```bash
npm run seed
```

This creates:
- 4 dummy users (passwords are hashed automatically)
- 8 dummy trains
- Test credentials: `yugandhar@example.com` / `password123`

### Step 4: Start Server
```bash
npm run dev
```

Server will start at `http://localhost:5000`

---

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run seed` | Seed database with dummy data |

---

## 🧪 Quick Test

After starting the server, test it:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all trains
curl http://localhost:5000/api/trains

# Login with test credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yugandhar@example.com","password":"password123"}'
```

---

## 📱 Frontend Integration

In your React app (`railway-app`), update your API calls to use:

```javascript
const API_URL = 'http://localhost:5000/api';
```

Example with fetch:
```javascript
// Signup
const response = await fetch(`${API_URL}/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});

// Login
const loginResponse = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'yugandhar@example.com',
    password: 'password123'
  })
});

// Get token from response
const token = (await loginResponse.json()).token;

// Protected request
const profileResponse = await fetch(`${API_URL}/auth/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Check your internet connection and MongoDB URI in .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- [Full README](./README.md) - Complete API documentation
- [API Usage Examples](./API_USAGE.md) - cURL and JavaScript examples
- [Database Schema](./README.md#database-structure) - Data models

---

## ✅ What's Included

✅ Express.js REST API
✅ MongoDB Atlas Integration
✅ User Authentication (Signup/Login)
✅ Password Hashing (bcryptjs)
✅ JWT Authorization
✅ Train Management
✅ Booking System
✅ CORS Enabled
✅ Error Handling
✅ 4 Dummy Users
✅ 8 Dummy Trains

---

## 🔐 Security Notes

- ⚠️ Never commit `.env` to version control
- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use environment variables for sensitive data
- ⚠️ Enable HTTPS in production
- ⚠️ Implement rate limiting

---

## 🎯 Next Steps

1. ✅ Backend is ready
2. Connect frontend to backend (see Frontend Integration)
3. Add more endpoints as needed
4. Implement payment gateway
5. Add email notifications
6. Deploy to production

---

## 💡 Tips

- Use Postman or Insomnia to test API endpoints
- Check MongoDB Atlas dashboard to view data
- Use browser DevTools Network tab to debug requests
- Keep `nodemon` running during development for auto-reload

---

**Happy coding! 🎉**
