import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sampleAPI } from '../services/api';
import { Sample } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
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
      const response = await sampleAPI.createSamples(samples);
      setSubmittedSamples(response.data);
      setShowSuccess(true);
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

  const downloadQR = (qrCodeId: string, designNo: string) => {
    const canvas = document.getElementById(`qr-${qrCodeId}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-${designNo}-${qrCodeId}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // high-quality export
      link.click();
    }
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
                      className="input-optimized-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {submittedSamples.map((sample) => (
                  <div key={sample.qrCodeId} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
                    <div className="text-center">
                      <div className="mb-4">
                        <QRCodeCanvas
                          id={`qr-${sample.qrCodeId}`} 
                          value={sample.qrCodeId} // keep QR value short & unique
                          size={200}              // a bit bigger for clarity
                            level="M"               // medium error correction (less dense)
                          
                        />
                      </div>
                      <div className="text-sm font-medium text-gray-800 mb-2">
                        {sample.productionSampleType} - {sample.designNo}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        {sample.pieces} pieces
                      </div>
                      <button
                        onClick={() => downloadQR(sample.qrCodeId, sample.designNo)}
                        className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSample;
