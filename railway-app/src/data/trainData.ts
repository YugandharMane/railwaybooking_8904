export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: { name: string; fare: number; availableSeats: number }[];
}

export interface Booking {
  id: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  journeyDate: string;
  class: string;
  totalFare: number;
  status: 'confirmed' | 'waitlisted' | 'completed';
  userEmail?: string;
}

export const stations = [
  'Delhi (NDLS)',
  'Mumbai (CSTM)',
  'Kolkata (HWH)',
  'Chennai (MAS)',
  'Bangalore (SBC)',
  'Hyderabad (SC)',
  'Ahmedabad (ADI)',
  'Jaipur (JP)',
  'Pune (PUNE)',
  'Lucknow (LKO)',
];

export const trains: Train[] = [
  {
    id: '1',
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'Delhi (NDLS)',
    destination: 'Mumbai (CSTM)',
    departureTime: '16:25',
    arrivalTime: '08:15',
    duration: '15h 50m',
    classes: [
      { name: '1AC', fare: 4250, availableSeats: 12 },
      { name: '2AC', fare: 2480, availableSeats: 48 },
      { name: '3AC', fare: 1735, availableSeats: 62 },
    ],
  },
  {
    id: '2',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani',
    source: 'Delhi (NDLS)',
    destination: 'Kolkata (HWH)',
    departureTime: '17:00',
    arrivalTime: '09:55',
    duration: '16h 55m',
    classes: [
      { name: '1AC', fare: 3870, availableSeats: 8 },
      { name: '2AC', fare: 2295, availableSeats: 32 },
      { name: '3AC', fare: 1585, availableSeats: 45 },
    ],
  },
  {
    id: '3',
    trainNumber: '12008',
    trainName: 'Shatabdi Express',
    source: 'Delhi (NDLS)',
    destination: 'Jaipur (JP)',
    departureTime: '06:05',
    arrivalTime: '10:25',
    duration: '4h 20m',
    classes: [
      { name: 'CC', fare: 810, availableSeats: 78 },
      { name: 'EC', fare: 1515, availableSeats: 18 },
    ],
  },
  {
    id: '4',
    trainNumber: '12625',
    trainName: 'Kerala Express',
    source: 'Delhi (NDLS)',
    destination: 'Chennai (MAS)',
    departureTime: '11:45',
    arrivalTime: '03:05',
    duration: '39h 20m',
    classes: [
      { name: '2AC', fare: 3390, availableSeats: 28 },
      { name: '3AC', fare: 2335, availableSeats: 42 },
    ],
  },
  {
    id: '5',
    trainNumber: '12010',
    trainName: 'Gujarat Mail',
    source: 'Mumbai (CSTM)',
    destination: 'Ahmedabad (ADI)',
    departureTime: '23:15',
    arrivalTime: '07:25',
    duration: '8h 10m',
    classes: [
      { name: '2AC', fare: 1250, availableSeats: 36 },
      { name: '3AC', fare: 890, availableSeats: 58 },
      { name: 'SL', fare: 420, availableSeats: 124 },
    ],
  },
  {
    id: '6',
    trainNumber: '12649',
    trainName: 'Karnataka Express',
    source: 'Delhi (NDLS)',
    destination: 'Bangalore (SBC)',
    departureTime: '22:00',
    arrivalTime: '08:15',
    duration: '34h 15m',
    classes: [
      { name: '1AC', fare: 4835, availableSeats: 6 },
      { name: '2AC', fare: 2840, availableSeats: 34 },
      { name: '3AC', fare: 1985, availableSeats: 48 },
    ],
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'BK12345',
    pnr: '4521678901',
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'Delhi (NDLS)',
    destination: 'Mumbai (CSTM)',
    journeyDate: '2026-03-15',
    class: '2AC',
    totalFare: 4960,
    status: 'confirmed',
  },
  {
    id: 'BK12346',
    pnr: '5678901234',
    trainNumber: '12008',
    trainName: 'Shatabdi Express',
    source: 'Delhi (NDLS)',
    destination: 'Jaipur (JP)',
    journeyDate: '2026-03-22',
    class: 'CC',
    totalFare: 810,
    status: 'confirmed',
  },
  {
    id: 'BK12347',
    pnr: '8901234567',
    trainNumber: '12625',
    trainName: 'Kerala Express',
    source: 'Delhi (NDLS)',
    destination: 'Chennai (MAS)',
    journeyDate: '2026-02-10',
    class: '3AC',
    totalFare: 4670,
    status: 'completed',
  },
];
