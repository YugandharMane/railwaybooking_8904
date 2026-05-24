import { User } from '../models/User.js';
import { generateToken } from '../utils/auth.js';
import { catchAsyncErrors } from '../utils/errorHandler.js';

export const signup = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, age, gender, address } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    age,
    gender,
    address,
  });

  // Generate token
  const token = generateToken(user._id);

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: userResponse,
  });
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Find user and select password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Check password
  const isPasswordMatched = await user.matchPassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: userResponse,
  });
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});
