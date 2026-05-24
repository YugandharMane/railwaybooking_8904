import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: true,
    },
    passengers: [
      {
        name: String,
        age: Number,
        gender: String,
        seatNumber: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Cancelled'],
      default: 'Confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid',
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
