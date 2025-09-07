import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { Sample } from '../types';

const DailyProduction: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    merchant: '',
    designNo: '',
    productionSampleType: '',
    startDate: '',
    endDate: ''
  });

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const response = await sampleAPI.getAllSamples();
      setSamples(response.data);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSamples = useCallback(() => {
    let filtered = samples;

    if (filters.merchant) {
      filtered = filtered.filter(sample =>
        sample.merchant.toLowerCase().includes(filters.merchant.toLowerCase())
      );
    }

    if (filters.designNo) {
      filtered = filtered.filter(sample =>
        sample.designNo.toLowerCase().includes(filters.designNo.toLowerCase())
      );
    }

    if (filters.productionSampleType) {
      filtered = filtered.filter(sample =>
        sample.productionSampleType.toLowerCase().includes(filters.productionSampleType.toLowerCase())
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(sample =>
        new Date(sample.dateCreated) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(sample =>
        new Date(sample.dateCreated) <= endDate
      );
    }

    setFilteredSamples(filtered);
  }, [samples, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      merchant: '',
      designNo: '',
      productionSampleType: '',
      startDate: '',
      endDate: ''
    });
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    filterSamples();
  }, [filterSamples]);

  // Get unique values for dropdowns
  const uniqueMerchants = Array.from(new Set(samples.map(sample => sample.merchant))).sort();
  const uniqueDesignNos = Array.from(new Set(samples.map(sample => sample.designNo))).sort();
  const uniqueTypes = Array.from(new Set(samples.map(sample => sample.productionSampleType))).sort();

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
            Allen Jorgio - Daily Production
          </h1>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filters</h3>
            <div className="space-y-3">
              {/* Single Row with 5 Columns */}
              <div className="grid grid-cols-5 gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <select
                    id="merchant"
                    value={filters.merchant}
                    onChange={(e) => handleFilterChange('merchant', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="">All Merchants</option>
                    {uniqueMerchants.map(merchant => (
                      <option key={merchant} value={merchant}>{merchant}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="designNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Design Number
                  </label>
                  <select
                    id="designNo"
                    value={filters.designNo}
                    onChange={(e) => handleFilterChange('designNo', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="">All Design Numbers</option>
                    {uniqueDesignNos.map(designNo => (
                      <option key={designNo} value={designNo}>{designNo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={filters.productionSampleType}
                    onChange={(e) => handleFilterChange('productionSampleType', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
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

          {/* Production Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading production data...</p>
              </div>
            ) : filteredSamples.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-600">No production data available for the selected filters.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No of Pieces Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSamples.map((sample, index) => (
                    <motion.tr
                      key={sample._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sample.dateCreated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sample.merchant}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                        {sample.designNo}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                        {sample.productionSampleType}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sample.pieces}
                        </span>
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

export default DailyProduction;