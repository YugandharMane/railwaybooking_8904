import { Link } from 'react-router-dom';
import { Train, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">CloudRail</span>
          </div>
          <p className="text-sm">
            Your trusted partner for seamless railway reservations across India.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <Link to="/" className="block hover:text-white">Home</Link>
            <Link to="/search" className="block hover:text-white">Search Trains</Link>
            <Link to="/dashboard" className="block hover:text-white">My Bookings</Link>
            <Link to="/login" className="block hover:text-white">Login</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4">Contact</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>1800-123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>support@cloudrail.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
        © 2026 CloudRail. All rights reserved.
      </div>
    </footer>
  );
}
