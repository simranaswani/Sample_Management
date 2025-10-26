import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { packingSlipAPI } from '../services/api';
import { Download, Package, User, Hash, Eye, X } from 'lucide-react';

interface ReceiverHistoryItem {
  merchant: string;
  designNo: string;
  totalPieces: number;
  packingSlipNumbers: string[];
}

interface ReceiverHistory {
  receiverName: string;
  totalPackingSlips: number;
  combinations: ReceiverHistoryItem[];
}

interface PackingSlipDetail {
  date: string;
  packingSlipNumber: string;
  courier: string;
  docNo: string;
}

const ReceiverHistory: React.FC = () => {
  const [receiverHistory, setReceiverHistory] = useState<ReceiverHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReceiverHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<{
    receiverName: string;
    merchant: string;
    designNo: string;
    packingSlips: PackingSlipDetail[];
  } | null>(null);

  useEffect(() => {
    fetchReceiverHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [receiverHistory, searchTerm, selectedReceiver]);

  const fetchReceiverHistory = async () => {
    try {
      setLoading(true);
      const response = await packingSlipAPI.getReceiverHistory();
      setReceiverHistory(response.data);
    } catch (error) {
      console.error('Error fetching receiver history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...receiverHistory];

    // Filter by receiver name
    if (selectedReceiver) {
      filtered = filtered.filter(receiver => 
        receiver.receiverName.toLowerCase().includes(selectedReceiver.toLowerCase())
      );
    }

    // Filter by search term (merchant or design number)
    if (searchTerm) {
      filtered = filtered.map(receiver => ({
        ...receiver,
        combinations: receiver.combinations.filter(combo =>
          combo.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          combo.designNo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(receiver => receiver.combinations.length > 0);
    }

    setFilteredHistory(filtered);
  };

  const handleViewDetails = async (receiverName: string, merchant: string, designNo: string, packingSlipNumbers: string[]) => {
    try {
      // Fetch all packing slips to get details
      const response = await packingSlipAPI.getAllPackingSlips();
      const allPackingSlips = response.data;
      
      // Filter packing slips that match the criteria
      const matchingSlips = allPackingSlips.filter((slip: any) => 
        slip.receiverName === receiverName &&
        slip.items.some((item: any) => item.merchant === merchant && item.designNo === designNo) &&
        packingSlipNumbers.includes(slip.packingSlipNumber)
      );
      
      // Format the data for the popup
      const packingSlipDetails: PackingSlipDetail[] = matchingSlips.map((slip: any) => ({
        date: new Date(slip.date).toLocaleDateString(),
        packingSlipNumber: slip.packingSlipNumber,
        courier: slip.courier || 'Not dispatched',
        docNo: slip.docNo || 'Not dispatched'
      }));
      
      setPopupData({
        receiverName,
        merchant,
        designNo,
        packingSlips: packingSlipDetails
      });
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching packing slip details:', error);
    }
  };

  const exportToPDF = () => {
    // Create a simple PDF-like export using window.print()
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Receiver History Report</h1>
        <p style="text-align: center; margin-bottom: 30px;">Generated on: ${new Date().toLocaleDateString()}</p>
        ${filteredHistory.map(receiver => `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">${receiver.receiverName}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Merchant</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Design No</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Total Pieces</th>
                </tr>
              </thead>
              <tbody>
                ${receiver.combinations.map(combo => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 12px;">${combo.merchant}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${combo.designNo}</td>
                    <td style="border: 1px solid #ddd; padding: 12px;">${combo.totalPieces}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getUniqueReceivers = () => {
    return Array.from(new Set(receiverHistory.map(r => r.receiverName))).sort();
  };

  const getTotalCombinations = () => {
    return filteredHistory.reduce((total, receiver) => total + receiver.combinations.length, 0);
  };

  const getTotalPieces = () => {
    return filteredHistory.reduce((total, receiver) => 
      total + receiver.combinations.reduce((receiverTotal, combo) => 
        receiverTotal + combo.totalPieces, 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receiver history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Receiver History
              </h1>
              <p className="text-gray-600">
                View all unique merchant and design combinations sent to each receiver
              </p>
            </div>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Receivers</p>
                  <p className="text-2xl font-bold text-blue-900">{filteredHistory.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-600">Total Combinations</p>
                  <p className="text-2xl font-bold text-green-900">{getTotalCombinations()}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex items-center">
                <Hash className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Pieces</p>
                  <p className="text-2xl font-bold text-purple-900">{getTotalPieces()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedReceiver('');
                }}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by merchant or design number"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select
                value={selectedReceiver}
                onChange={(e) => setSelectedReceiver(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Filter by receiver</option>
                {getUniqueReceivers().map(receiver => (
                  <option key={receiver} value={receiver}>
                    {receiver}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-600">
                  {receiverHistory.length === 0 
                    ? "No dispatched packing slips found. Items must have Courier and Doc No. to appear here."
                    : "No results match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {filteredHistory.map((receiver, index) => (
                  <motion.div
                    key={receiver.receiverName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {receiver.receiverName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {receiver.combinations.length} unique combinations • {receiver.totalPackingSlips} packing slips
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Pieces</p>
                          <p className="text-lg font-bold text-gray-900">
                            {receiver.combinations.reduce((total, combo) => total + combo.totalPieces, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Merchant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Design No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Pieces
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {receiver.combinations.map((combo, comboIndex) => (
                            <motion.tr
                              key={`${combo.merchant}-${combo.designNo}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: comboIndex * 0.05 }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {combo.merchant}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {combo.designNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {combo.totalPieces}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <button
                                  onClick={() => handleViewDetails(receiver.receiverName, combo.merchant, combo.designNo, combo.packingSlipNumbers)}
                                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Popup for Packing Slip Details */}
      {showPopup && popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Packing Slip Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {popupData.receiverName} - {popupData.merchant} {popupData.designNo}
                </p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Packing Slip Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doc No
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popupData.packingSlips.map((slip, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.packingSlipNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.courier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.docNo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReceiverHistory;
