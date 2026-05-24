import { Train } from '../models/Train.js';
import { catchAsyncErrors } from '../utils/errorHandler.js';

export const getAllTrains = catchAsyncErrors(async (req, res, next) => {
  const trains = await Train.find();

  res.status(200).json({
    success: true,
    count: trains.length,
    data: trains,
  });
});

export const searchTrains = catchAsyncErrors(async (req, res, next) => {
  const { source, destination, date } = req.query;

  if (!source || !destination) {
    return res.status(400).json({
      success: false,
      message: 'Please provide source and destination',
    });
  }

  const trains = await Train.find({
    source: { $regex: source, $options: 'i' },
    destination: { $regex: destination, $options: 'i' },
  });

  res.status(200).json({
    success: true,
    count: trains.length,
    data: trains,
  });
});

export const getTrainById = catchAsyncErrors(async (req, res, next) => {
  const train = await Train.findById(req.params.id);

  if (!train) {
    return res.status(404).json({
      success: false,
      message: 'Train not found',
    });
  }

  res.status(200).json({
    success: true,
    data: train,
  });
});
