import { Booking } from '../models/Booking.js';
import { Train } from '../models/Train.js';
import { catchAsyncErrors } from '../utils/errorHandler.js';

export const createBooking = catchAsyncErrors(async (req, res, next) => {
  const { trainId, passengers, totalPrice } = req.body;

  if (!trainId || !passengers || passengers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide trainId and passengers',
    });
  }

  // Check train availability
  const train = await Train.findById(trainId);
  if (!train) {
    return res.status(404).json({
      success: false,
      message: 'Train not found',
    });
  }

  if (train.availableSeats < passengers.length) {
    return res.status(400).json({
      success: false,
      message: 'Not enough seats available',
    });
  }

  // Create booking
  const booking = await Booking.create({
    userId: req.user.id,
    trainId,
    passengers,
    totalPrice,
  });

  // Update available seats
  train.availableSeats -= passengers.length;
  await train.save();

  res.status(201).json({
    success: true,
    message: 'Booking confirmed',
    data: booking,
  });
});

export const getUserBookings = catchAsyncErrors(async (req, res, next) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('trainId');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

export const getBookingById = catchAsyncErrors(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('trainId');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking',
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

export const cancelBooking = catchAsyncErrors(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  // Check ownership
  if (booking.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking',
    });
  }

  if (booking.bookingStatus === 'Cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Booking already cancelled',
    });
  }

  // Update booking status
  booking.bookingStatus = 'Cancelled';
  await booking.save();

  // Refund seats
  const train = await Train.findById(booking.trainId);
  train.availableSeats += booking.passengers.length;
  await train.save();

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking,
  });
});
