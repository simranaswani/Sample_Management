import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Package, TrendingUp, ArrowRight, QrCode, Clock, FileText, Shield, Search, History } from 'lucide-react';
import AllenJorgioLogo from '../components/AllenJorgioLogo';

import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const features = [
    {
      title: 'Create Sample Entry',
      description: 'Add new textile samples with QR code generation',
      icon: Plus,
      path: '/create-sample',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'Current Stock Status',
      description: 'View aggregated stock levels and inventory status',
      icon: BarChart3,
      path: '/stock-status',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Create Packing Slip',
      description: 'Generate packing slips with QR code scanning',
      icon: Package,
      path: '/create-packing-slip',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Daily Production',
      description: 'View daily production reports and analytics',
      icon: TrendingUp,
      path: '/daily-production',
      color: 'bg-yellow-600',
      hoverColor: 'hover:bg-yellow-700'
    },
    {
      title: 'View QR Codes',
      description: 'Search and manage all generated sample QR codes',
      icon: Search,
      path: '/view-qrs',
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    },
    {
      title: 'Packing History',
      description: 'View and manage previous packing slip records',
      icon: History,
      path: '/packing-slip-history',
      color: 'bg-pink-600',
      hoverColor: 'hover:bg-pink-700'
    },
    ...(user?.role === 'admin' ? [{
      title: 'User Management',
      description: 'Approve account requests and manage permissions',
      icon: Shield,
      path: '/admin/users',
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700'
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <AllenJorgioLogo size="lg" showSubtitle={false} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary-600 mb-2">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">
              Sample Management System
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Streamline your textile manufacturing workflow with QR code integration,
              inventory tracking, and automated packing slip generation.
            </p>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={feature.path}>
                  <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 h-full flex flex-col group">
                    <div className="text-center flex-1">
                      <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">{feature.description}</p>
                      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors">
                        <span className="text-sm font-medium mr-2">Get Started</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-2">QR Code Generation</div>
              <div className="text-gray-600">Automatic QR code creation for each sample</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-2">Real-time Tracking</div>
              <div className="text-gray-600">Live inventory and production monitoring</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-2">PDF Export</div>
              <div className="text-gray-600">Professional packing slip generation</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
