import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { BookOpen, Train, Plus, DownloadCloud, CheckCircle, XCircle, Clock, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { trains as defaultTrains } from '../data/trainData';

const TRAIN_STORAGE_KEY = 'railway-trains';
const BOOKING_STORAGE_KEY = 'railway-bookings';

function loadSavedTrains() {
  if (typeof window === 'undefined') return defaultTrains;
  const saved = localStorage.getItem(TRAIN_STORAGE_KEY);
  if (!saved) return defaultTrains;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Invalid saved train data, resetting.', error);
    localStorage.removeItem(TRAIN_STORAGE_KEY);
    return defaultTrains;
  }
}

function saveTrains(trains: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRAIN_STORAGE_KEY, JSON.stringify(trains));
}

function loadSavedBookings() {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Invalid saved bookings, resetting.', error);
    localStorage.removeItem(BOOKING_STORAGE_KEY);
    return [];
  }
}

function saveBookings(bookings: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings));
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [trains, setTrains] = useState<any[]>(loadSavedTrains());
  const [bookings, setBookings] = useState<any[]>(loadSavedBookings());
  const [form, setForm] = useState({
    trainNumber: '',
    trainName: '',
    source: '',
    destination: '',
    journeyDate: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
    isActive: true,
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setTrains(loadSavedTrains());
    setBookings(loadSavedBookings());
  }, [user, navigate]);

  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalFare || 0), 0);
  const activeTrains = trains.filter(train => train.isActive).length;

  const handleInputChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      trainNumber: '',
      trainName: '',
      source: '',
      destination: '',
      journeyDate: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
      totalSeats: '',
      isActive: true,
    });
    setEditId(null);
  };

  const handleSaveTrain = () => {
    if (!form.trainNumber || !form.trainName || !form.source || !form.destination || !form.journeyDate) {
      showToast('error', 'Please fill all required train fields');
      return;
    }

    const updatedTrain = {
      id: editId || `T-${Date.now()}`,
      trainNumber: form.trainNumber,
      trainName: form.trainName,
      source: form.source,
      destination: form.destination,
      journeyDate: form.journeyDate,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      price: Number(form.price) || 0,
      totalSeats: Number(form.totalSeats) || 0,
      availableSeats: Number(form.totalSeats) || 0,
      isActive: form.isActive,
      classes: [
        { name: '1AC', fare: Number(form.price) || 0, availableSeats: Math.max(Number(form.totalSeats) * 0.15, 1) },
        { name: '2AC', fare: Number(form.price * 0.7) || 0, availableSeats: Math.max(Number(form.totalSeats) * 0.25, 1) },
        { name: '3AC', fare: Number(form.price * 0.5) || 0, availableSeats: Math.max(Number(form.totalSeats) * 0.4, 1) }
      ]
    };

    let newTrains = [...trains];
    if (editId) {
      newTrains = newTrains.map(train => train.id === editId ? { ...train, ...updatedTrain } : train);
      showToast('success', 'Train schedule updated');
    } else {
      newTrains.unshift(updatedTrain);
      showToast('success', 'New train added');
    }

    setTrains(newTrains);
    saveTrains(newTrains);
    resetForm();
  };

  const handleEditTrain = (train: any) => {
    setEditId(train.id);
    setForm({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      source: train.source,
      destination: train.destination,
      journeyDate: train.journeyDate,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      price: train.price.toString(),
      totalSeats: train.totalSeats.toString(),
      isActive: train.isActive,
    });
  };

  const handleToggleActive = (id: string) => {
    const updatedTrains = trains.map(train => train.id === id ? { ...train, isActive: !train.isActive } : train);
    setTrains(updatedTrains);
    saveTrains(updatedTrains);
    showToast('success', 'Train active state updated');
  };

  const handleDownloadBookingPdf = (booking: any) => {
    const doc = new jsPDF();
    const lines = [
      'Railway Booking Invoice',
      '-----------------------',
      `PNR: ${booking.pnr}`,
      `Booking ID: ${booking.id}`,
      `User: ${booking.userEmail || 'N/A'}`,
      `Train: ${booking.trainName} (#${booking.trainNumber})`,
      `Route: ${booking.source} → ${booking.destination}`,
      `Journey Date: ${booking.journeyDate}`,
      `Class: ${booking.class}`,
      `Total Fare: ₹${booking.totalFare}`,
      `Status: ${booking.status}`,
      '',
      'Thank you for booking with CloudRail!'
    ];

    lines.forEach((line, index) => {
      doc.text(line, 14, 20 + index * 10);
    });

    doc.save(`booking-${booking.pnr}.pdf`);
  };

  const allRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalFare || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage trains, schedules, and view all bookings.</p>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Train className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Active Trains</span>
            </div>
            <p className="text-3xl font-bold">{activeTrains}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Total Bookings</span>
            </div>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Revenue</span>
            </div>
            <p className="text-3xl font-bold">₹{allRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">Total Trains</span>
            </div>
            <p className="text-3xl font-bold">{trains.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Train Management</h2>
                <p className="text-sm text-gray-500">Create and schedule new trains.</p>
              </div>
              <Plus className="w-5 h-5 text-blue-600" />
            </div>

            <div className="grid gap-4 mb-6">
              {['trainNumber', 'trainName', 'source', 'destination', 'journeyDate', 'departureTime', 'arrivalTime', 'price', 'totalSeats'].map((key) => (
                <div key={key} className="grid gap-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    value={(form as any)[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    type={key === 'journeyDate' ? 'date' : key === 'price' || key === 'totalSeats' ? 'number' : 'text'}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              ))}
              <button onClick={handleSaveTrain} className="mt-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editId ? 'Update Train' : 'Add New Train'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Train</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trains.map(train => (
                    <tr key={train.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-3 font-medium">{train.trainName} <span className="text-xs text-gray-500">#{train.trainNumber}</span></td>
                      <td className="px-4 py-3">{train.source.split(' (')[0]} → {train.destination.split(' (')[0]}</td>
                      <td className="px-4 py-3">{train.journeyDate} · {train.departureTime} - {train.arrivalTime}</td>
                      <td className="px-4 py-3">{train.availableSeats}/{train.totalSeats}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${train.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {train.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => handleEditTrain(train)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleToggleActive(train.id)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DownloadCloud className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Booking Overview</h2>
                <p className="text-sm text-gray-500">Download booking invoices.</p>
              </div>
            </div>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-700">
                  <p className="text-sm font-medium">{booking.trainName} · {booking.trainNumber}</p>
                  <p className="text-xs text-gray-500">{booking.userEmail || 'Unknown'} • {booking.journeyDate}</p>
                  <button onClick={() => handleDownloadBookingPdf(booking)} className="mt-3 w-full py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">PNR</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Train</th>
                  <th className="px-4 py-3">Journey</th>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3">{booking.pnr}</td>
                    <td className="px-4 py-3">{booking.userEmail || 'Unknown'}</td>
                    <td className="px-4 py-3">{booking.trainName}</td>
                    <td className="px-4 py-3">{booking.source.split(' (')[0]} → {booking.destination.split(' (')[0]} · {booking.journeyDate}</td>
                    <td className="px-4 py-3">₹{booking.totalFare}</td>
                    <td className="px-4 py-3 capitalize">{booking.status}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDownloadBookingPdf(booking)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
