import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { packingSlipAPI } from '../services/api';
import { PackingSlip } from '../types';

const PackingSlipHistory: React.FC = () => {
  const [packingSlips, setPackingSlips] = useState<PackingSlip[]>([]);
  const [filteredSlips, setFilteredSlips] = useState<PackingSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    receiverName: '',
    brokerName: '',
    packingSlipNumber: '',
    date: ''
  });

  const fetchPackingSlips = async () => {
    setLoading(true);
    try {
      const response = await packingSlipAPI.getAllPackingSlips();
      setPackingSlips(response.data);
    } catch (error) {
      console.error('Error fetching packing slips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPackingSlips = useCallback(() => {
    let filtered = packingSlips;

    if (filters.receiverName) {
      filtered = filtered.filter(slip =>
        slip.receiverName.toLowerCase().includes(filters.receiverName.toLowerCase())
      );
    }

    if (filters.brokerName) {
      filtered = filtered.filter(slip =>
        slip.brokerName?.toLowerCase().includes(filters.brokerName.toLowerCase())
      );
    }

    if (filters.packingSlipNumber) {
      filtered = filtered.filter(slip =>
        slip.packingSlipNumber.toLowerCase().includes(filters.packingSlipNumber.toLowerCase())
      );
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(slip =>
        new Date(slip.date).toDateString() === filterDate
      );
    }

    setFilteredSlips(filtered);
  }, [packingSlips, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      receiverName: '',
      brokerName: '',
      packingSlipNumber: '',
      date: ''
    });
  };

  const downloadPDF = async (slipId: string, packingSlipNumber: string) => {
    try {
      const response = await packingSlipAPI.generatePDF(slipId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packing-slip-${packingSlipNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  useEffect(() => {
    fetchPackingSlips();
  }, []);

  useEffect(() => {
    filterPackingSlips();
  }, [filterPackingSlips]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Allen Jorgio - Packing Slip History
          </h1>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filters</h3>
            <div className="space-y-3">
              {/* Single Row with 4 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver
                  </label>
                  <input
                    type="text"
                    value={filters.receiverName}
                    onChange={(e) => handleFilterChange('receiverName', e.target.value)}
                    placeholder="Filter by receiver"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broker
                  </label>
                  <input
                    type="text"
                    value={filters.brokerName}
                    onChange={(e) => handleFilterChange('brokerName', e.target.value)}
                    placeholder="Filter by broker"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packing Slip Number
                  </label>
                  <input
                    type="text"
                    value={filters.packingSlipNumber}
                    onChange={(e) => handleFilterChange('packingSlipNumber', e.target.value)}
                    placeholder="Filter by slip number"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>

              {/* Clear Filters Button Row */}
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Packing Slips Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading packing slip history...</p>
              </div>
            ) : filteredSlips.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-600">No packing slips found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Packing Slip Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlips.map((slip, index) => (
                    <motion.tr
                      key={slip._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(slip.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {slip.packingSlipNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.receiverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.brokerName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {slip.items.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => downloadPDF(slip._id!, slip.packingSlipNumber)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Download PDF
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PackingSlipHistory;
