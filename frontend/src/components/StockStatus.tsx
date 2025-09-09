import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { StockSummary } from '../types';
import { BarChart3, Package, Search, Filter, X, Clock, Layers, RefreshCw } from 'lucide-react';

const StockStatus: React.FC = () => {
  const [stockData, setStockData] = useState<StockSummary[]>([]);
  const [filteredStockData, setFilteredStockData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    merchant: '',
    designNo: ''
  });
  const [summary, setSummary] = useState({
    totalSamples: 0,
    totalPieces: 0,
    lastUpdated: ''
  });

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      // Only pass merchant filter to API, designNo will be filtered client-side
      const apiFilters = { merchant: filters.merchant };
      const response = await sampleAPI.getStockSummary(apiFilters);
      
      // Add null check for response data
      if (response.data && Array.isArray(response.data)) {
        setStockData(response.data);
        // Don't apply filters here, let the separate useEffect handle it
      } else {
        console.error('Invalid response data structure:', response.data);
        setStockData([]);
        setFilteredStockData([]);
        setSummary({ totalSamples: 0, totalPieces: 0, lastUpdated: new Date().toLocaleString() });
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData([]);
      setFilteredStockData([]);
      setSummary({ totalSamples: 0, totalPieces: 0, lastUpdated: new Date().toLocaleString() });
    } finally {
      setLoading(false);
    }
  }, [filters.merchant]);

  const applyFilters = useCallback((data: StockSummary[]) => {
    let filtered = data;

    // Apply merchant filter (client-side for additional filtering)
    if (filters.merchant) {
      filtered = filtered.filter(item =>
        item?.merchant?.toLowerCase().includes(filters.merchant.toLowerCase())
      );
    }

    // Apply design number filter
    if (filters.designNo) {
      filtered = filtered.filter(item =>
        item?._id?.designNo?.toLowerCase().includes(filters.designNo.toLowerCase())
      );
    }

    setFilteredStockData(filtered);
    
    // Calculate summary with null checks
    const totalPieces = filtered.reduce((sum: number, item: StockSummary) => {
      return sum + (item?.totalPieces || 0);
    }, 0);
    const totalSamples = filtered.length;
    const lastUpdated = new Date().toLocaleString();
    
    setSummary({ totalSamples, totalPieces, lastUpdated });
  }, [filters.merchant, filters.designNo]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ merchant: '', designNo: '' });
  };

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Apply filters when stock data or filter values change
  useEffect(() => {
    if (stockData.length > 0) {
      applyFilters(stockData);
    }
  }, [applyFilters, stockData]);

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
              Current Stock Status
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
                  <Layers className="w-6 h-6" color="white" />
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-900">Types</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalSamples}</p>
                <p className="text-sm text-gray-500 mt-1">Categories</p>
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
                <p className="text-sm text-gray-500 mt-1">Inventory</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-center h-16 bg-purple-600">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 -mt-5">
                  <Clock className="w-6 h-6" color="white" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                value={filters.merchant}
                onChange={(e) => handleFilterChange('merchant', e.target.value)}
                placeholder="Filter by merchant"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="text"
                value={filters.designNo}
                onChange={(e) => handleFilterChange('designNo', e.target.value)}
                placeholder="Filter by design number"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>



          {/* Stock Data Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading stock data...</p>
              </div>
            ) : filteredStockData.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-600">No stock data found</p>
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pieces
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStockData.map((item, index) => (
                    <motion.tr
                      key={`${item?._id?.productionSampleType || 'unknown'}-${item?._id?.designNo || 'unknown'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?.merchant || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?._id?.designNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item?.totalPieces || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : 'N/A'}
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

export default StockStatus;
