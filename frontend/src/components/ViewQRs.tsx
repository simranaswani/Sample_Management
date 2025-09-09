import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { Sample } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

const ViewQRs: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingSample, setDeletingSample] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<Sample | null>(null);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const response = await sampleAPI.getAllSamples();
      setSamples(response.data);
    } catch (error) {
      console.error('Error fetching samples:', error);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSamples = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredSamples(samples);
      return;
    }

    const filtered = samples.filter(sample =>
      sample.designNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.productionSampleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.merchant.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSamples(filtered);
  }, [samples, searchTerm]);

  const handleSampleClick = (sample: Sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const downloadQR = (sample: Sample) => {
    const canvas = document.getElementById(`qr-${sample.qrCodeId}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${sample.designNo}-${sample.qrCodeId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const printSticker = (sample: Sample) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get QR code data URL
    const canvas = document.getElementById(`qr-${sample.qrCodeId}`) as HTMLCanvasElement;
    const qrDataURL = canvas ? canvas.toDataURL() : '';

    // Create sticker HTML
    const stickerHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>QR Sticker - ${sample.designNo}</title>
  <style>
    @page {
      size: 2in 1.2in;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 6px;
      font-family: Arial, sans-serif;
      width: 2in;
      height: 1.2in;
      box-sizing: border-box;
    }
    .sticker {
      position: relative;   /* allows absolute positioning inside */
      width: 100%;
      height: 100%;
      border: 1px solid #000;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .merchant {
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      line-height: 1;
    }
    .design-no {
      font-size: 14px;
      margin: 2px 0 0 0;
      line-height: 1;
      color: #000;
    }
    .qr-code {
      position: absolute;   /* take QR out of flow */
      bottom: 2px;          /* gap from bottom border */
      right: 2px;           /* gap from right border */
      width: 78px;
      height: 78px;
    }
  </style>
</head>
<body>
  <div class="sticker">
    <div class="merchant">${sample.merchant}</div>
    <div class="design-no">${sample.designNo}</div>
    <img src="${qrDataURL}" alt="QR Code" class="qr-code" />
  </div>
</body>
</html>

    `;

    printWindow.document.write(stickerHTML);
    printWindow.document.close();
    
    // Wait for image to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const getQRData = (sample: Sample) => {
    return JSON.stringify({
      merchant: sample.merchant,
      productionSampleType: sample.productionSampleType,
      designNo: sample.designNo,
      qrCodeId: sample.qrCodeId
    });
  };

  const showDeleteConfirmation = (sample: Sample) => {
    setSampleToDelete(sample);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sampleToDelete?._id) {
      console.error('No sample ID found for deletion');
      return;
    }

    setDeletingSample(sampleToDelete._id);
    
    try {
      await sampleAPI.deleteSample(sampleToDelete._id);
      
      // Remove from local state
      setSamples(prev => prev.filter(s => s._id !== sampleToDelete._id));
      setFilteredSamples(prev => prev.filter(s => s._id !== sampleToDelete._id));
      
      // Close modal if the deleted sample was selected
      if (selectedSample?._id === sampleToDelete._id) {
        setShowModal(false);
        setSelectedSample(null);
      }
      
      // Show success message (you can replace this with a toast notification)
      alert('QR code deleted successfully!');
    } catch (error) {
      console.error('Error deleting sample:', error);
      alert('Error deleting QR code. Please try again.');
    } finally {
      setDeletingSample(null);
      setShowDeleteModal(false);
      setSampleToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSampleToDelete(null);
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    filterSamples();
  }, [filterSamples]);

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
            Allen Jorgio - View Sample QR Codes
          </h1>

            {/* Search Bar */}
            <div className="mb-8">
             <div className="max-w-4xl">
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search by Design No., Type, or Merchant..."
                 className="input-optimized w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>
            </div>

          {/* QR Codes Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading QR codes...</p>
            </div>
          ) : filteredSamples.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600">
                {searchTerm ? 'No samples found matching your search.' : 'No samples available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSamples.map((sample, index) => (
                <motion.div
                  key={sample._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSampleClick(sample)}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="text-center">
                    <div className="mb-4">
                      <QRCodeCanvas
                        id={`qr-${sample.qrCodeId}`}
                        value={getQRData(sample)}
                        size={120}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {sample.merchant}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {sample.designNo}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {sample.productionSampleType}
                    </div>
                    <div className="flex justify-center space-x-1 flex-wrap gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadQR(sample);
                        }}
                        className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          printSticker(sample);
                        }}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        Print
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSampleClick(sample);
                        }}
                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(sample);
                        }}
                        disabled={deletingSample === sample._id}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deletingSample === sample._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal */}
        {showModal && selectedSample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Sample Details
              </h3>
              
              <div className="text-center mb-6">
                <QRCodeCanvas
                  value={getQRData(selectedSample)}
                  size={200}
                />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900">{selectedSample.productionSampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Design No.:</span>
                  <span className="text-gray-900">{selectedSample.designNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Merchant:</span>
                  <span className="text-gray-900">{selectedSample.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Pieces:</span>
                  <span className="text-gray-900">{selectedSample.pieces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="text-gray-900">
                    {new Date(selectedSample.dateCreated).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">QR ID:</span>
                  <span className="text-gray-900 text-xs font-mono">
                    {selectedSample.qrCodeId}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 flex-wrap gap-2">
                <button
                  onClick={() => downloadQR(selectedSample)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Download QR
                </button>
                <button
                  onClick={() => printSticker(selectedSample)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Print Sticker
                </button>
                <button
                  onClick={() => {
                    showDeleteConfirmation(selectedSample);
                    setShowModal(false);
                  }}
                  disabled={deletingSample === selectedSample._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingSample === selectedSample._id ? 'Deleting...' : 'Delete QR'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {showDeleteModal && sampleToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete QR Code</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this QR code?
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Merchant:</span>
                      <span className="text-sm text-gray-900">{sampleToDelete.merchant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Design No:</span>
                      <span className="text-sm text-gray-900">{sampleToDelete.designNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <span className="text-sm text-gray-900">{sampleToDelete.productionSampleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Pieces:</span>
                      <span className="text-sm text-gray-900">{sampleToDelete.pieces}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingSample === sampleToDelete._id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {deletingSample === sampleToDelete._id ? 'Deleting...' : 'Delete QR Code'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ViewQRs;
