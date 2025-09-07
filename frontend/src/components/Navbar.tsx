import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, BarChart3, TrendingUp, Package, History, Search } from 'lucide-react';
import AllenJorgioLogo from './AllenJorgioLogo';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create-sample', label: 'Create Sample', icon: Plus },
    { path: '/stock-status', label: 'Stock Status', icon: BarChart3 },
    { path: '/daily-production', label: 'Daily Production', icon: TrendingUp },
    { path: '/create-packing-slip', label: 'Packing Slip', icon: Package },
    { path: '/packing-slip-history', label: 'Packing History', icon: History },
    { path: '/view-qrs', label: 'View QRs', icon: Search },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="transition-transform duration-200"
              >
                <AllenJorgioLogo size="md" showSubtitle={true} />
              </motion.div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
