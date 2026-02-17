import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Home, Plus, BarChart3, TrendingUp, Package, History, Search, Users, LogOut, LogIn, Shield, User as UserIcon } from 'lucide-react';
import AllenJorgioLogo from './AllenJorgioLogo';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    ...(user ? [
      { path: '/create-sample', label: 'Create Sample', icon: Plus },
      { path: '/stock-status', label: 'Stock Status', icon: BarChart3 },
      { path: '/daily-production', label: 'Daily Production', icon: TrendingUp },
      { path: '/create-packing-slip', label: 'Packing Slip', icon: Package },
      { path: '/packing-slip-history', label: 'Packing History', icon: History },
      { path: '/view-qrs', label: 'View QRs', icon: Search },
      ...(user.role === 'admin' ? [{ path: '/admin/users', label: 'User Management', icon: Shield }] : []),
    ] : []),
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = router.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 group ${isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1.5"
                    >
                      <IconComponent className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                      <span className="hidden xl:inline text-xs font-medium">{item.label}</span>
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

            {/* Auth Section */}
            <div className="flex items-center border-l border-gray-100 ml-4 pl-4 space-x-3">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-semibold text-gray-900">{user.name}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
