import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { Sample } from '../types';
import { BarChart3, Package, Search, Filter, X, Clock, Layers, RefreshCw, Calendar, Factory } from 'lucide-react';

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
  const [summary, setSummary] = useState({
    totalSamples: 0,
    totalPieces: 0,
    lastUpdated: ''
  });

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const response = await sampleAPI.getAllSamples();
      const allSamples = response.data;
      
      // Expand samples with batch history and group by date + merchant/type/design
      const expandedSamples: any[] = [];
      const dateGroupMap = new Map<string, any>();
      
      allSamples.forEach((sample: any) => {
        if (sample.batchHistory && sample.batchHistory.length > 0) {
          // Group batches by date
          sample.batchHistory.forEach((batch: any) => {
            const batchDate = batch.dateCreated 
              ? new Date(batch.dateCreated).toISOString().split('T')[0]
              : sample.dateCreated 
                ? new Date(sample.dateCreated).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            
            // Create unique key for date + merchant + type + design
            const groupKey = `${batchDate}_${sample.merchant}_${sample.productionSampleType}_${sample.designNo}`;
            
            if (dateGroupMap.has(groupKey)) {
              // Add pieces to existing entry for this date/combination
              const existing = dateGroupMap.get(groupKey);
              existing.pieces += batch.pieces;
            } else {
              // Create new entry for this date/combination
              dateGroupMap.set(groupKey, {
                merchant: sample.merchant,
                productionSampleType: sample.productionSampleType,
                designNo: sample.designNo,
                pieces: batch.pieces,
                dateCreated: batchDate,
                _id: groupKey
              });
            }
          });
        } else {
          // If no batch history, add the sample as is (for backward compatibility)
          const date = sample.dateCreated 
            ? new Date(sample.dateCreated).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          const groupKey = `${date}_${sample.merchant}_${sample.productionSampleType}_${sample.designNo}`;
          
          if (dateGroupMap.has(groupKey)) {
            const existing = dateGroupMap.get(groupKey);
            existing.pieces += sample.pieces || 0;
          } else {
            expandedSamples.push({
              merchant: sample.merchant,
              productionSampleType: sample.productionSampleType,
              designNo: sample.designNo,
              pieces: sample.pieces || 0,
              dateCreated: date,
              _id: groupKey
            });
          }
        }
      });
      
      // Convert map values to array and sort by date (newest first)
      const groupedSamples = Array.from(dateGroupMap.values());
      groupedSamples.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      
      // Combine grouped samples with any remaining expanded samples
      const allGrouped = [...groupedSamples, ...expandedSamples];
      
      setSamples(allGrouped);
    } catch (error) {
      console.error('Error fetching samples:', error);
      setSamples([]);
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
    
    // Calculate summary
    const totalPieces = filtered.reduce((sum, sample) => sum + (sample.pieces || 0), 0);
    const totalSamples = filtered.length;
    const lastUpdated = new Date().toLocaleString();
    
    setSummary({ totalSamples, totalPieces, lastUpdated });
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
          className="bg-white rounded-xl shadow-lg p-6 mt-4"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Daily Production Record
            </h1>
            <div className="text-sm text-gray-600">
              Allen Jorgio Textile Management
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-center h-16 bg-blue-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 -mt-5">
                  <Factory className="w-6 h-6" color="white" />
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalSamples}</p>
                <p className="text-sm text-gray-500 mt-1">Production Entries</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-center h-16 bg-green-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 -mt-5">
                  <Package className="w-6 h-6" color="white" />
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Total Pieces</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalPieces}</p>
                <p className="text-sm text-gray-500 mt-1">Produced</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-center h-16 bg-purple-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 -mt-5">
                  <Calendar className="w-6 h-6" color="white" />
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Last Updated</h3>
                <p className="text-xl font-semibold text-gray-800 mt-2">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">Real-time</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label htmlFor="merchant" className="block text-xs font-medium text-gray-700 mb-1">
                  Merchant
                </label>
                <select
                  id="merchant"
                  value={filters.merchant}
                  onChange={(e) => handleFilterChange('merchant', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                >
                  <option value="">All Merchants</option>
                  {uniqueMerchants.map(merchant => (
                    <option key={merchant} value={merchant}>{merchant}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="designNo" className="block text-xs font-medium text-gray-700 mb-1">
                  Design Number
                </label>
                <select
                  id="designNo"
                  value={filters.designNo}
                  onChange={(e) => handleFilterChange('designNo', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                >
                  <option value="">All Design Numbers</option>
                  {uniqueDesignNos.map(designNo => (
                    <option key={designNo} value={designNo}>{designNo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={filters.productionSampleType}
                  onChange={(e) => handleFilterChange('productionSampleType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                >
                  <option value="">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1">
                <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-full"
                />
              </div>

              <div className="lg:col-span-1">
                <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Production Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
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
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Design Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      No of Pieces Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSamples.map((sample, index) => {
                    const uniqueKey = sample._id || `sample-${index}`;
                    return (
                      <motion.tr
                        key={uniqueKey}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/5">
                          {new Date(sample.dateCreated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/5">
                          {sample.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/5">
                          {sample.designNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/5">
                          {sample.productionSampleType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-1/5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sample.pieces}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
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