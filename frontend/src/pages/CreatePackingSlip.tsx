import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { packingSlipAPI } from '../services/api';
import { PackingSlip, PackingSlipItem } from '../types';
import PackingSlipQRScanner from '../components/PackingSlipQRScanner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CreatePackingSlip: React.FC = () => {
  const [formData, setFormData] = useState({
    receiverName: '',
    brokerName: '',
    packingSlipNumber: `PS-${Date.now()}`,
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
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    // Update serial numbers
    const renumberedItems = updatedItems.map((item, i) => ({
      ...item,
      srNo: i + 1
    }));
    setItems(renumberedItems);
  };

  const updateItem = (index: number, field: keyof PackingSlipItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
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
      setCreatedSlip(response.data);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        receiverName: '',
        brokerName: '',
        packingSlipNumber: `PS-${Date.now()}`,
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
      return;
    }

    try {
      console.log('Downloading PDF for slip ID:', createdSlip._id);
      const response = await packingSlipAPI.generatePDF(createdSlip._id);
      console.log('PDF response:', response);
      console.log('Response data size:', response.data.size);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packing-slip-${createdSlip.packingSlipNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Allen Jorgio - Create Packing Slip
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiver *
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => handleInputChange('receiverName', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Broker
                  </label>
                  <input
                    type="text"
                    value={formData.brokerName}
                    onChange={(e) => handleInputChange('brokerName', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Packing Slip Number *
                  </label>
                  <input
                    type="text"
                    value={formData.packingSlipNumber}
                    readOnly
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>


            {/* Items Table */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    📷 Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added yet. Add items manually or scan QR codes.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sr. No.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sample Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Design No.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pieces</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QR ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.srNo}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.merchant}
                              onChange={(e) => updateItem(index, 'merchant', e.target.value)}
                              className="input-optimized-sm px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.productionSampleType}
                              onChange={(e) => updateItem(index, 'productionSampleType', e.target.value)}
                              className="input-optimized-sm px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.designNo}
                              onChange={(e) => updateItem(index, 'designNo', e.target.value)}
                              className="input-optimized-sm px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.totalPieces}
                              onChange={(e) => updateItem(index, 'totalPieces', parseInt(e.target.value) || 0)}
                              className="input-optimized-sm px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.qrCodeId ? item.qrCodeId.substring(0, 8) + '...' : 'Manual'}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
                <p>Items: {createdSlip.items.length}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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
