import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Calendar, Train, Clock } from 'lucide-react';
import { trains as defaultTrains, stations } from '../data/trainData';

const TRAIN_STORAGE_KEY = 'railway-trains';

function loadSavedTrains() {
  if (typeof window === 'undefined') return defaultTrains;
  const saved = localStorage.getItem(TRAIN_STORAGE_KEY);
  if (!saved) return defaultTrains;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(TRAIN_STORAGE_KEY);
    return defaultTrains;
  }
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [trainList, setTrainList] = useState(() => loadSavedTrains());

  useEffect(() => {
    setTrainList(loadSavedTrains());
  }, []);

  const results = from && to
    ? trainList.filter(t => t.source === from && t.destination === to)
    : trainList;

  const handleBook = (trainId: string, className: string) => {
    navigate(`/booking?train=${trainId}&class=${className}&date=${date}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 -mt-12 relative z-10">
          <h2 className="text-xl font-bold mb-4">Search Trains</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={from} onChange={e => setFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option value="">All Stations</option>
                  {stations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={to} onChange={e => setTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option value="">All Stations</option>
                  {stations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <SearchIcon className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{results.length} trains found</p>
          
          {results.map((train, i) => (
            <motion.div
              key={train.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">{train.trainName}</span>
                    <span className="text-sm text-gray-500">#{train.trainNumber}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{train.departureTime}</p>
                      <p className="text-sm text-gray-500">{train.source.split(' (')[0]}</p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs mx-2">
                        <Clock className="w-3 h-3 inline mr-1" />{train.duration}
                      </div>
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{train.arrivalTime}</p>
                      <p className="text-sm text-gray-500">{train.destination.split(' (')[0]}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:ml-6">
                  {train.classes.map(cls => (
                    <button
                      key={cls.name}
                      onClick={() => handleBook(train.id, cls.name)}
                      className="px-4 py-2 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left min-w-[80px]"
                    >
                      <p className="font-medium text-sm">{cls.name}</p>
                      <p className="text-xs text-gray-500">{cls.availableSeats} seats</p>
                      <p className="text-blue-600 font-bold">₹{cls.fare}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
