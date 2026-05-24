import { Link, useLocation } from 'react-router-dom';
import { Train, Sun, Moon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    ...(isAuthenticated ? [{ name: 'Home', path: '/' }] : []),
    ...(isAuthenticated && user?.role === 'passenger' ? [{ name: 'Search', path: '/search' }] : []),
    ...(isAuthenticated ? [{ name: user?.role === 'admin' ? 'Admin' : 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/dashboard' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Train className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">CloudRail</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium ${
                location.pathname === link.path ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
          </button>
          {isAuthenticated ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.name?.split(' ')[0]}</span>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Login
            </Link>
          )}
        </div>

        {/* Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4 space-y-3">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-600 dark:text-gray-400"
            >
              {link.name}
            </Link>
          ))}
          <button onClick={toggleTheme} className="block py-2 text-gray-600 dark:text-gray-400">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          {!isAuthenticated && (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-blue-600 font-medium">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
