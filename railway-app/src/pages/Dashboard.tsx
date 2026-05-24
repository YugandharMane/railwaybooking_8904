import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Ticket, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'railway-bookings';

function loadSavedBookings(userEmail?: string) {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const allBookings = JSON.parse(saved) as any[];
    return userEmail ? allBookings.filter(b => b.userEmail === userEmail) : allBookings;
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [savedBookings, setSavedBookings] = useState<any[]>(() => loadSavedBookings(user?.email));

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setSavedBookings(loadSavedBookings(user?.email));
  }, [user?.email]);

  const bookingsData = savedBookings;
  const upcoming = bookingsData.filter(b => b.status === 'confirmed' || b.status === 'waitlisted');
  const completed = bookingsData.filter(b => b.status === 'completed');
  const bookings = tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <Ticket className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{bookingsData.length}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <Train className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{upcoming.length}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <Clock className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{completed.length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  tab === 'upcoming' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-500'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setTab('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  tab === 'completed' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-500'
                }`}
              >
                Completed
              </button>
            </div>
            <Link to="/search" className="text-sm text-blue-600 hover:underline">
              + New Booking
            </Link>
          </div>

          <div className="divide-y dark:divide-gray-700">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Train className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {tab} bookings</p>
              </div>
            ) : (
              bookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <Train className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.trainName}</p>
                        <p className="text-sm text-gray-500">#{booking.trainNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.source.split(' (')[0]} → {booking.destination.split(' (')[0]}
                      </p>
                      <p className="text-sm text-gray-500">{booking.journeyDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                        booking.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-sm font-medium mt-1">₹{booking.totalFare}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">PNR: {booking.pnr}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
