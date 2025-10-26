import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Home, Plus, BarChart3, TrendingUp, Package, History, Search, Users } from 'lucide-react';
import AllenJorgioLogo from './AllenJorgioLogo';

const Navbar: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create-sample', label: 'Create Sample', icon: Plus },
    { path: '/stock-status', label: 'Stock Status', icon: BarChart3 },
    { path: '/daily-production', label: 'Daily Production', icon: TrendingUp },
    { path: '/create-packing-slip', label: 'Packing Slip', icon: Package },
    { path: '/packing-slip-history', label: 'Packing History', icon: History },
    { path: '/receiver-history', label: 'Receiver History', icon: Users },
    { path: '/view-qrs', label: 'View QRs', icon: Search },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="transition-all duration-200"
              >
                <AllenJorgioLogo size="sm" showSubtitle={false} useImage={true} imageOnly={true} />
              </motion.div>
            </Link>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1.5"
                  >
                    <IconComponent className={`w-4 h-4 transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    <span className="hidden md:inline text-xs font-medium">{item.label}</span>
                  </motion.div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
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
