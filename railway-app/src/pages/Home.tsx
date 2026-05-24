import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Train, Shield, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { stations } from '../data/trainData';

const features = [
  { icon: Train, title: 'Easy Booking', desc: 'Book tickets in seconds' },
  { icon: Shield, title: 'Secure Payment', desc: 'Safe & encrypted transactions' },
  { icon: Clock, title: 'Real-time Updates', desc: 'Live train status tracking' },
  { icon: Star, title: 'Best Prices', desc: 'Competitive fares guaranteed' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ from, to, date });
    navigate(`/search?${params}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Train Journey
            </h1>
            <p className="text-blue-100 text-lg mb-10">
              Fast, simple, and reliable railway reservations
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="bg-white rounded-xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 text-left">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={from} onChange={e => setFrom(e.target.value)} required
                    className="w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900">
                    <option value="">Select</option>
                    {stations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 text-left">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={to} onChange={e => setTo(e.target.value)} required
                    className="w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900">
                    <option value="">Select</option>
                    {stations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 text-left">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900" />
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Search Trains
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { from: 'Delhi', to: 'Mumbai', time: '15h 50m', price: '₹695' },
              { from: 'Delhi', to: 'Kolkata', time: '16h 55m', price: '₹585' },
              { from: 'Mumbai', to: 'Chennai', time: '21h 30m', price: '₹480' },
            ].map((route, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setFrom(stations.find(s => s.includes(route.from)) || '');
                  setTo(stations.find(s => s.includes(route.to)) || '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-semibold">{route.from}</span>
                  <span className="flex-1 border-t border-dashed border-white/50"></span>
                  <Train className="w-4 h-4" />
                  <span className="flex-1 border-t border-dashed border-white/50"></span>
                  <span className="font-semibold">{route.to}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-100">
                  <span>{route.time}</span>
                  <span className="font-bold text-lg">From {route.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Travel?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join millions of happy travelers booking with CloudRail
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Book Now
          </button>
        </div>
      </section>
    </div>
  );
}
