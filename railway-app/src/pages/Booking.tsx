import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, CheckCircle, ArrowLeft } from 'lucide-react';
import { trains as defaultTrains } from '../data/trainData';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'railway-bookings';
const TRAIN_STORAGE_KEY = 'railway-trains';

function loadSavedBookings() {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Invalid booking data in storage, resetting.', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveBookingToStorage(booking: any) {
  const saved = loadSavedBookings();
  saved.push(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function loadSavedTrains() {
  if (typeof window === 'undefined') return defaultTrains;
  const saved = localStorage.getItem(TRAIN_STORAGE_KEY);
  if (!saved) return defaultTrains;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Invalid train data in storage, resetting.', error);
    localStorage.removeItem(TRAIN_STORAGE_KEY);
    return defaultTrains;
  }
}

function saveTrains(trains: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAIN_STORAGE_KEY, JSON.stringify(trains));
}

function decrementClassSeats(trainList: any[], trainId: string, className: string, count: number) {
  return trainList.map(train => {
    if (train.id !== trainId) return train;

    const classes = train.classes.map((c: any) => {
      if (c.name !== className) return c;
      return {
        ...c,
        availableSeats: Math.max(0, (c.availableSeats || 0) - count)
      };
    });

    const totalAvailable = classes.reduce((sum: number, c: any) => sum + Number(c.availableSeats || 0), 0);
    return {
      ...train,
      classes,
      availableSeats: totalAvailable
    };
  });
}

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [pnr, setPnr] = useState('');
  const [trainList, setTrainList] = useState(() => loadSavedTrains());

  useEffect(() => {
    setTrainList(loadSavedTrains());
  }, []);

  const trainId = searchParams.get('train');
  const className = searchParams.get('class');
  const date = searchParams.get('date');
  
  const train = trainList.find(t => t.id === trainId);
  const trainClass = train?.classes.find(c => c.name === className);

  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: 'Male' }
  ]);

  useEffect(() => {
    if (!train) navigate('/search');
  }, [train, navigate]);

  if (!train || !trainClass) return null;

  const totalFare = trainClass.fare * passengers.length;

  const handleBook = async () => {
    const isValid = passengers.every(p => p.name && p.age);
    if (!isValid) {
      showToast('error', 'Please fill all passenger details');
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const generatedPnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setPnr(generatedPnr);

    const booking = {
      id: `BK${Date.now()}`,
      pnr: generatedPnr,
      trainId: train.id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      source: train.source,
      destination: train.destination,
      journeyDate: date || '',
      class: className || '',
      totalFare,
      status: 'confirmed',
      userEmail: user?.email || 'guest',
      bookingDate: new Date().toISOString()
    };

    saveBookingToStorage(booking);
    const updatedTrainList = decrementClassSeats(trainList, train.id, className || '', passengers.length);
    setTrainList(updatedTrainList);
    saveTrains(updatedTrainList);
    setBooked(true);
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 mb-6">Your ticket has been booked successfully</p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">PNR Number</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{pnr}</p>
          </div>

          <div className="space-y-2 text-sm text-left mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Train</span>
              <span className="font-medium">{train.trainName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Route</span>
              <span className="font-medium">{train.source.split(' (')[0]} → {train.destination.split(' (')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-blue-600">₹{totalFare.toLocaleString()}</span>
            </div>
          </div>

          <Link to="/dashboard"
            className="block w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            View My Bookings
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 dark:text-gray-400 mb-6 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Train className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-semibold">{train.trainName}</h2>
              <p className="text-sm text-gray-500">#{train.trainNumber} • {className}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{train.source} → {train.destination}</span>
            <span>{date}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Passenger Details</h3>
          <div className="space-y-4">
            {passengers.map((p, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Passenger {i + 1}</span>
                  {passengers.length > 1 && (
                    <button onClick={() => setPassengers(prev => prev.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:text-red-600">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={p.name}
                    onChange={e => {
                      const updated = [...passengers];
                      updated[i].name = e.target.value;
                      setPassengers(updated);
                    }}
                    className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={p.age}
                    onChange={e => {
                      const updated = [...passengers];
                      updated[i].age = e.target.value;
                      setPassengers(updated);
                    }}
                    className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                  />
                  <select
                    value={p.gender}
                    onChange={e => {
                      const updated = [...passengers];
                      updated[i].gender = e.target.value;
                      setPassengers(updated);
                    }}
                    className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPassengers([...passengers, { name: '', age: '', gender: 'Male' }])}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            + Add Passenger
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">Base Fare ({passengers.length} × ₹{trainClass.fare})</span>
            <span className="font-medium">₹{totalFare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mb-6">
            <span>Total</span>
            <span className="text-blue-600">₹{totalFare.toLocaleString()}</span>
          </div>
          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
