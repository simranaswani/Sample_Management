import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { Sample } from '../types';
import MicroQRCode from './MicroQR';
import { Plus, Trash2, Download, CheckCircle, X } from 'lucide-react';

const CreateSample: React.FC = () => {
  const [samples, setSamples] = useState<Omit<Sample, '_id' | 'qrCodeId'>[]>([
    {
      merchant: '',
      productionSampleType: '',
      designNo: '',
      pieces: 0,
      dateCreated: new Date().toISOString().split('T')[0]
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSamples, setSubmittedSamples] = useState<Sample[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const [merchantSearch, setMerchantSearch] = useState<{ [key: number]: string }>({});

  // Helper function to map production sample types to codes
  const getTypeCode = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'Hanger': 'HG',
      'Paper Booklet': 'PB',
      'Export Booklet': 'EB',
      'Swatch Card': 'SC'
    };
    return typeMap[type] || type; // fallback to original type if not found
  };
  const getQRData = (sample: Sample) => {
    const typeCode = getTypeCode(sample.productionSampleType);
    return `${sample.merchant}_${sample.designNo}_${typeCode}`;
  };

  // Common merchants list for dropdown
  const commonMerchants = [
    'Allen Jorgio',
    'Textile Corp',
    'Fashion House',
    'Design Studio',
    'Fabric World',
    'Style Co',
    'Trendy Textiles',
    'Modern Fabrics',
    'Elite Designs',
    'Premium Textiles'
  ];

  const addSample = () => {
    setSamples([...samples, {
      merchant: '',
      productionSampleType: '',
      designNo: '',
      pieces: 0,
      dateCreated: new Date().toISOString().split('T')[0]
    }]);
  };

  const removeSample = (index: number) => {
    if (samples.length > 1) {
      setSamples(samples.filter((_, i) => i !== index));
    }
  };

  const updateSample = (index: number, field: keyof typeof samples[0], value: string | number) => {
    const updatedSamples = [...samples];
    updatedSamples[index] = { ...updatedSamples[index], [field]: value };
    setSamples(updatedSamples);
  };

  const handleMerchantSearch = (index: number, value: string) => {
    setMerchantSearch(prev => ({ ...prev, [index]: value }));
    updateSample(index, 'merchant', value);
    setMerchantDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const handleMerchantSelect = (index: number, merchant: string) => {
    updateSample(index, 'merchant', merchant);
    setMerchantSearch(prev => ({ ...prev, [index]: merchant }));
    setMerchantDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleMerchantDropdown = (index: number) => {
    setMerchantDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getFilteredMerchants = (index: number) => {
    const searchTerm = merchantSearch[index] || '';
    return commonMerchants.filter(merchant =>
      merchant.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate samples before submission
      const validSamples = samples.filter(sample => 
        sample.merchant.trim() !== '' && 
        sample.productionSampleType.trim() !== '' && 
        sample.designNo.trim() !== '' && 
        sample.pieces > 0
      );

      if (validSamples.length === 0) {
        alert('Please fill in all required fields for at least one sample.');
        setIsSubmitting(false);
        return;
      }

      if (validSamples.length !== samples.length) {
        const invalidCount = samples.length - validSamples.length;
        if (!confirm(`${invalidCount} sample(s) have incomplete information and will be skipped. Continue with ${validSamples.length} valid sample(s)?`)) {
          setIsSubmitting(false);
          return;
        }
      }

      const response = await sampleAPI.createSamples(validSamples);
      
      // Handle the API response structure
      if (response.data.results && response.data.results.created > 0) {
        // For bulk import, use the created samples from the response
        const validSamples = (response.data.data || []).filter((sample: any) => sample != null);
        setSubmittedSamples(validSamples);
        setShowSuccess(true);
        
        // Show a message indicating if samples were updated
        if (validSamples.length > 0) {
          console.log(`${validSamples.length} sample(s) processed successfully. Some may have been updated if they already existed.`);
        }
      } else {
        // Handle single sample creation
        const singleSample = response.data.sample;
        if (singleSample) {
          setSubmittedSamples([singleSample]);
          setShowSuccess(true);
        }
      }
      setSamples([{
        merchant: '',
        productionSampleType: '',
        designNo: '',
        pieces: 0,
        dateCreated: new Date().toISOString().split('T')[0]
      }]);
    } catch (error) {
      console.error('Error creating samples:', error);
      alert('Error creating samples. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = (sample: Sample, qrId?: string) => {
    const id = qrId || sample.qrCodeId || sample._id || 'unknown';
    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      const qrData = getQRData(sample);
      link.download = `qr-${qrData}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // high-quality export
      link.click();
    }
  };

  // Print Sticker with QR + text (matching ViewQRs)
  const printSticker = (sample: Sample, qrId?: string) => {
    const id = qrId || sample.qrCodeId || sample._id || 'unknown';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = document.getElementById(`qr-${id}`) as HTMLCanvasElement;
    const qrDataURL = canvas ? canvas.toDataURL() : '';

    const qrData = getQRData(sample);
    const stickerHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>QR Sticker - ${qrData}</title>
  <style>
    @page {
      size: 2in 1in;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 4px;
      font-family: Arial, sans-serif;
      width: 2in;
      height: 1in;
      box-sizing: border-box;
    }
    .sticker {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      height: 100%;
      border: 1px solid #000;
      padding: 4px;
      box-sizing: border-box;
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .merchant {
      font-size: 13px;
      font-weight: bold;
      margin: 0;
      line-height: 1.2;
    }
    .design-no {
      font-size: 13px;
      margin: 2px 0 0 0;
      line-height: 1.2;
      color: #000;
    }
    .qr-code {
      width: 70px;
      height: 70px;
    }
  </style>
</head>
<body>
  <div class="sticker">
    <div class="text">
      <div class="merchant">${sample.merchant}</div>
      <div class="design-no">${sample.designNo}</div>
    </div>
    <img src="${qrDataURL}" alt="QR Code" class="qr-code" />
  </div>
</body>
</html>
    `;

    printWindow.document.write(stickerHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Sample Entry
            </h1>
            <p className="text-gray-600">
              Add new textile samples with QR code generation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {samples.map((sample, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Sample Entry #{index + 1}
                  </h3>
                  {samples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSample(index)}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merchant
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={merchantSearch[index] || sample.merchant}
                        onChange={(e) => handleMerchantSearch(index, e.target.value)}
                        onFocus={() => setMerchantDropdownOpen(prev => ({ ...prev, [index]: true }))}
                        placeholder="Type to search merchants..."
                        className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleMerchantDropdown(index)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown */}
                      {merchantDropdownOpen[index] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {getFilteredMerchants(index).length > 0 ? (
                            getFilteredMerchants(index).map((merchant) => (
                              <button
                                key={merchant}
                                type="button"
                                onClick={() => handleMerchantSelect(index, merchant)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                {merchant}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No merchants found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={sample.productionSampleType}
                      onChange={(e) => updateSample(index, 'productionSampleType', e.target.value)}
                      className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Paper Booklet">Paper Booklet</option>
                      <option value="Hanger">Hanger</option>
                      <option value="Export Booklet">Export Booklet</option>
                      <option value="Swatch Card">Swatch Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design No.
                    </label>
                    <input
                      type="text"
                      value={sample.designNo}
                      onChange={(e) => updateSample(index, 'designNo', e.target.value)}
                      placeholder="e.g., A1, A2, B1"
                      className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Pieces
                    </label>
                    <input
                      type="number"
                      value={sample.pieces}
                      onChange={(e) => updateSample(index, 'pieces', parseInt(e.target.value) || 0)}
                      min="1"
                      className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={sample.dateCreated}
                      onChange={(e) => updateSample(index, 'dateCreated', e.target.value)}
                      className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={addSample}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Sample</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Samples</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Message and QR Codes */}
          {showSuccess && submittedSamples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 p-8 bg-green-50 border border-green-200 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">
                    Samples Created Successfully!
                  </h3>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submittedSamples.filter((sample: any) => sample != null).map((sample, index) => {
                  // Generate a fallback ID if qrCodeId is missing
                  const qrId = sample.qrCodeId || sample._id || `fallback-${index}`;
                  return (
                    <div key={qrId} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
                      <div className="text-center">
                        <div className="mb-4">
                          <MicroQRCode
                            id={`qr-${qrId}`} 
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
                            onClick={() => downloadQR(sample, qrId)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => printSticker(sample, qrId)}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Print
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSample;
