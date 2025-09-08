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
      width: 100%;
      height: 100%;
      border: 1px solid #000;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .top-half {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: left;
      border-bottom: 1px solid #000; /* horizontal center line */
      text-align: center;
      padding: 2px;
    }
    .bottom-half {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 2px;
    }
    .merchant {
      font-size: 22px;
      font-weight: bold;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .design-no {
      font-size: 20px;
      color: #000;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .qr-code {
      width: 45px;
      height: 45px;
    }
  </style>
</head>
<body>
  <div class="sticker">
    <div class="top-half">
      <div class="merchant">${sample.merchant}</div>
    </div>
    <div class="bottom-half">
      <div class="design-no">${sample.designNo}</div>
      <img src="${qrDataURL}" alt="QR Code" class="qr-code" />
    </div>
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
                    <div className="flex justify-center space-x-1">
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
                        Print Sticker
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
              
              <div className="flex justify-center space-x-3">
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
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
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
