import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { packingSlipAPI } from '../services/api';
import { PackingSlip, PackingSlipItem } from '../types';
import PackingSlipQRScanner from '../components/PackingSlipQRScanner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CreatePackingSlip: React.FC = () => {
  // Generate financial year format packing slip number
  const generatePackingSlipNumber = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 0-based month
    
    // Indian financial year starts from April (month 4)
    // If current month is April or later, use current year, otherwise use previous year
    const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const financialYearShort = financialYear.toString().slice(-2) + (financialYear + 1).toString().slice(-2);
    
    // For frontend preview, we'll use a placeholder count
    // The actual count will be determined by the backend
    return `PS-${financialYearShort}XXXX`;
  };

  const [formData, setFormData] = useState({
    receiverName: '',
    brokerName: '',
    packingSlipNumber: generatePackingSlipNumber(),
    date: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState<PackingSlipItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSlip, setCreatedSlip] = useState<PackingSlip | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: PackingSlipItem = {
      srNo: items.length + 1,
      merchant: '',
      productionSampleType: '',
      designNo: '',
      totalPieces: 0
    };
    const updatedItems = [...items, newItem];
    // Sort items alphabetically by merchant name
    const sortedItems = updatedItems.sort((a, b) => {
      const merchantA = a.merchant.toLowerCase();
      const merchantB = b.merchant.toLowerCase();
      return merchantA.localeCompare(merchantB);
    });
    // Update serial numbers after sorting
    const renumberedItems = sortedItems.map((item, index) => ({
      ...item,
      srNo: index + 1
    }));
    setItems(renumberedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    // Sort items alphabetically by merchant name
    const sortedItems = updatedItems.sort((a, b) => {
      const merchantA = a.merchant.toLowerCase();
      const merchantB = b.merchant.toLowerCase();
      return merchantA.localeCompare(merchantB);
    });
    // Update serial numbers after sorting
    const renumberedItems = sortedItems.map((item, i) => ({
      ...item,
      srNo: i + 1
    }));
    setItems(renumberedItems);
  };

  const updateItem = (index: number, field: keyof PackingSlipItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If merchant field is updated, sort items alphabetically
    if (field === 'merchant') {
      const sortedItems = updatedItems.sort((a, b) => {
        const merchantA = a.merchant.toLowerCase();
        const merchantB = b.merchant.toLowerCase();
        return merchantA.localeCompare(merchantB);
      });
      // Update serial numbers after sorting
      const renumberedItems = sortedItems.map((item, i) => ({
        ...item,
        srNo: i + 1
      }));
      setItems(renumberedItems);
    } else {
      setItems(updatedItems);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const packingSlipData: Omit<PackingSlip, '_id'> = {
        ...formData,
        items,
        date: new Date().toISOString()
      };

      console.log('Submitting packing slip data:', JSON.stringify(packingSlipData, null, 2));
      console.log('Items being submitted:', items);

      const response = await packingSlipAPI.createPackingSlip(packingSlipData);
      console.log('Created slip response:', response.data);
      
      // Add null check for response data
      if (response.data && response.data.packingSlip && response.data.packingSlip.items && Array.isArray(response.data.packingSlip.items)) {
        setCreatedSlip(response.data.packingSlip);
        setShowSuccess(true);
      } else {
        console.error('Invalid response data structure:', response.data);
        alert('Error: Invalid response from server. Please try again.');
      }
      
      // Reset form
      setFormData({
        receiverName: '',
        brokerName: '',
        packingSlipNumber: generatePackingSlipNumber(),
        date: new Date().toISOString().split('T')[0]
      });
      setItems([]);
    } catch (error) {
      console.error('Error creating packing slip:', error);
      alert('Error creating packing slip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    if (!createdSlip?._id) {
      console.error('No created slip ID found');
      alert('No packing slip data available for download.');
      return;
    }

    try {
      console.log('Downloading PDF for slip ID:', createdSlip._id);
      const response = await packingSlipAPI.generatePDF(createdSlip._id);
      console.log('PDF response:', response);
      
      // Check if response data exists and is valid
      if (!response.data) {
        throw new Error('No PDF data received from server');
      }
      
      console.log('Response data size:', response.data.size || 'unknown');
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packing-slip-${createdSlip.packingSlipNumber || 'unknown'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Error downloading PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-4 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
            Allen Jorgio - Create Packing Slip
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 md:p-5 rounded-lg overflow-hidden">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                {/* Receiver */}
                <div className="space-y-1.5 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Receiver <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => handleInputChange('receiverName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Broker */}
                <div className="space-y-1.5 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Broker
                  </label>
                  <input
                    type="text"
                    value={formData.brokerName}
                    onChange={(e) => handleInputChange('brokerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Packing Slip Number */}
                <div className="space-y-1.5 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Packing Slip Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.packingSlipNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                  />
                  <p className="text-xs text-gray-500 break-words">
                    Auto-generated in format PS-{new Date().getFullYear().toString().slice(-2)}{(new Date().getFullYear() + 1).toString().slice(-2)}XXXX
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-1.5 min-w-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>


            {/* Items Table */}
            <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-4 md:space-y-0 md:space-x-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Add items manually or scan QR codes. Fill in all required fields.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                    >
                      Scan QR
                    </button>
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Add Item
                    </button>
                  </div>
                </div>


              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added yet. Add items manually or scan QR codes.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 mobile-table">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sr. No.</th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Design No.</th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pieces</th>
                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-2 md:px-4 py-2 text-sm text-gray-900">{item.srNo}</td>
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="text"
                              value={item.merchant}
                              onChange={(e) => updateItem(index, 'merchant', e.target.value)}
                              placeholder={item.merchant ? "" : "Enter merchant name"}
                              className="input-optimized-sm mobile-button"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="text"
                              value={item.productionSampleType}
                              onChange={(e) => updateItem(index, 'productionSampleType', e.target.value)}
                              placeholder={item.productionSampleType ? "" : "Paper Booklet, Hanger, etc."}
                              className="input-optimized-sm mobile-button"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="text"
                              value={item.designNo}
                              onChange={(e) => updateItem(index, 'designNo', e.target.value)}
                              placeholder={item.designNo ? "" : "Enter design number"}
                              className="input-optimized-sm mobile-button"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-2">
                            <input
                              type="number"
                              value={item.totalPieces}
                              onChange={(e) => updateItem(index, 'totalPieces', parseInt(e.target.value) || 0)}
                              placeholder={item.totalPieces > 0 ? "" : "0"}
                              className="input-optimized-sm mobile-button"
                              min="1"
                            />
                          </td>
                          <td className="px-2 md:px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm mobile-button"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-center md:justify-end">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="mobile-button px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors w-full md:w-auto"
              >
                {isSubmitting ? 'Creating...' : 'Create Packing Slip'}
              </button>
            </div>
          </form>

          {/* Success Message */}
          {showSuccess && createdSlip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Packing Slip Created Successfully!
              </h3>
              <div className="text-green-700 mb-4">
                <p>Packing Slip Number: {createdSlip.packingSlipNumber}</p>
                <p>Receiver: {createdSlip.receiverName}</p>
                <p>Items: {createdSlip.items?.length || 0}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mobile-stack">
                <button
                  onClick={downloadPDF}
                  className="mobile-button px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mobile-button px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <PackingSlipQRScanner 
          items={items} 
          setItems={setItems} 
          onClose={() => setShowQRScanner(false)} 
        />
      )}
    </div>
  );
};

export default CreatePackingSlip;
