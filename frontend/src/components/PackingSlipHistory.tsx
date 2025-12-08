import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { packingSlipAPI } from '../services/api';
import { PackingSlip, PackingSlipItem } from '../types';

const PackingSlipHistory: React.FC = () => {
  const [packingSlips, setPackingSlips] = useState<PackingSlip[]>([]);
  const [filteredSlips, setFilteredSlips] = useState<PackingSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    receiverName: '',
    brokerName: '',
    packingSlipNumber: '',
    date: ''
  });
  const [dispatchPopup, setDispatchPopup] = useState<{
    isOpen: boolean;
    slipId: string;
    packingSlipNumber: string;
  }>({
    isOpen: false,
    slipId: '',
    packingSlipNumber: ''
  });
  const [dispatchData, setDispatchData] = useState({
    courier: '',
    docNo: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    courier: '',
    docNo: ''
  });
  const [editPopup, setEditPopup] = useState<{
    isOpen: boolean;
    slip?: PackingSlip | null;
  }>({ isOpen: false, slip: null });
  const [editFormData, setEditFormData] = useState({
    receiverName: '',
    brokerName: '',
    packingSlipNumber: '',
    date: '',
    courier: '',
    docNo: ''
  });
  const [editItems, setEditItems] = useState<PackingSlipItem[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    slipId?: string;
  }>({ isOpen: false, slipId: undefined });

  const fetchPackingSlips = async () => {
    setLoading(true);
    try {
      const response = await packingSlipAPI.getAllPackingSlips();
      console.log('Fetched packing slips:', response.data);
      setPackingSlips(response.data);
    } catch (error) {
      console.error('Error fetching packing slips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPackingSlips = useCallback(() => {
    let filtered = packingSlips;

    if (filters.receiverName) {
      filtered = filtered.filter(slip =>
        slip.receiverName.toLowerCase().includes(filters.receiverName.toLowerCase())
      );
    }

    if (filters.brokerName) {
      filtered = filtered.filter(slip =>
        slip.brokerName?.toLowerCase().includes(filters.brokerName.toLowerCase())
      );
    }

    if (filters.packingSlipNumber) {
      filtered = filtered.filter(slip =>
        slip.packingSlipNumber.toLowerCase().includes(filters.packingSlipNumber.toLowerCase())
      );
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(slip =>
        new Date(slip.date).toDateString() === filterDate
      );
    }

    setFilteredSlips(filtered);
  }, [packingSlips, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      receiverName: '',
      brokerName: '',
      packingSlipNumber: '',
      date: ''
    });
  };

  const downloadPDF = async (slipId: string, packingSlipNumber: string) => {
    try {
      const response = await packingSlipAPI.generatePDF(slipId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `packing-slip-${packingSlipNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const openDispatchPopup = (slipId: string, packingSlipNumber: string) => {
    setDispatchPopup({
      isOpen: true,
      slipId,
      packingSlipNumber
    });
    setDispatchData({ courier: '', docNo: '' });
    setValidationErrors({ courier: '', docNo: '' });
  };

  const closeDispatchPopup = () => {
    setDispatchPopup({
      isOpen: false,
      slipId: '',
      packingSlipNumber: ''
    });
    setDispatchData({ courier: '', docNo: '' });
    setValidationErrors({ courier: '', docNo: '' });
  };

  const handleDispatchSubmit = async () => {
    // Validate form fields
    const errors = {
      courier: !dispatchData.courier.trim() ? 'Courier is required' : '',
      docNo: !dispatchData.docNo.trim() ? 'Doc.No is required' : ''
    };
    
    setValidationErrors(errors);
    
    if (errors.courier || errors.docNo) {
      return;
    }

    try {
      console.log('Updating packing slip:', dispatchPopup.slipId, 'with data:', {
        courier: dispatchData.courier,
        docNo: dispatchData.docNo
      });

      // Update the packing slip with dispatch information
      const response = await packingSlipAPI.updatePackingSlip(dispatchPopup.slipId, {
        courier: dispatchData.courier,
        docNo: dispatchData.docNo
      });

      console.log('Update response:', response.data);

      // Update the local state immediately for better UX
      const updatedSlips = packingSlips.map(slip => 
        slip._id === dispatchPopup.slipId 
          ? { ...slip, courier: dispatchData.courier, docNo: dispatchData.docNo }
          : slip
      );
      
      console.log('Updated slips:', updatedSlips);
      setPackingSlips(updatedSlips);

      // Show success message
      console.log('Dispatch information updated successfully');

      // Close popup first
      closeDispatchPopup();
    } catch (error: any) {
      console.error('Error updating dispatch information:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const openEditPopup = (slip: PackingSlip) => {
    setEditPopup({ isOpen: true, slip });
    setEditFormData({
      receiverName: slip.receiverName,
      brokerName: slip.brokerName || '',
      packingSlipNumber: slip.packingSlipNumber,
      date: new Date(slip.date).toISOString().split('T')[0],
      courier: slip.courier || '',
      docNo: slip.docNo || ''
    });
    setEditItems(slip.items.map(item => ({ ...item })));
  };

  const closeEditPopup = () => {
    setEditPopup({ isOpen: false, slip: null });
    setEditFormData({
      receiverName: '',
      brokerName: '',
      packingSlipNumber: '',
      date: '',
      courier: '',
      docNo: ''
    });
    setEditItems([]);
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const addEditItem = () => {
    const newItem: PackingSlipItem = {
      srNo: editItems.length + 1,
      merchant: '',
      productionSampleType: '',
      designNo: '',
      totalPieces: 0
    };
    const updatedItems = [...editItems, newItem];
    const sortedItems = updatedItems.sort((a, b) => {
      const merchantA = a.merchant.toLowerCase();
      const merchantB = b.merchant.toLowerCase();
      return merchantA.localeCompare(merchantB);
    });
    const renumberedItems = sortedItems.map((item, index) => ({
      ...item,
      srNo: index + 1
    }));
    setEditItems(renumberedItems);
  };

  const removeEditItem = (index: number) => {
    const updatedItems = editItems.filter((_, i) => i !== index);
    const sortedItems = updatedItems.sort((a, b) => {
      const merchantA = a.merchant.toLowerCase();
      const merchantB = b.merchant.toLowerCase();
      return merchantA.localeCompare(merchantB);
    });
    const renumberedItems = sortedItems.map((item, i) => ({
      ...item,
      srNo: i + 1
    }));
    setEditItems(renumberedItems);
  };

  const updateEditItem = (index: number, field: keyof PackingSlipItem, value: string | number) => {
    const updatedItems = [...editItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'merchant') {
      const sortedItems = updatedItems.sort((a, b) => {
        const merchantA = a.merchant.toLowerCase();
        const merchantB = b.merchant.toLowerCase();
        return merchantA.localeCompare(merchantB);
      });
      const renumberedItems = sortedItems.map((item, i) => ({
        ...item,
        srNo: i + 1
      }));
      setEditItems(renumberedItems);
    } else {
      setEditItems(updatedItems);
    }
  };

  const handleEditSubmit = async () => {
    if (!editPopup.slip?._id) return;
    
    if (editItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const updatedData: Partial<PackingSlip> = {
        receiverName: editFormData.receiverName,
        brokerName: editFormData.brokerName,
        date: new Date(editFormData.date).toISOString(),
        items: editItems,
        courier: editFormData.courier,
        docNo: editFormData.docNo
      };

      const response = await packingSlipAPI.updatePackingSlip(editPopup.slip._id, updatedData);
      console.log('Update response:', response.data);

      // Update local state
      const updatedSlips = packingSlips.map(slip => 
        slip._id === editPopup.slip?._id 
          ? { ...slip, ...updatedData }
          : slip
      );
      setPackingSlips(updatedSlips);

      closeEditPopup();
      alert('Packing slip updated successfully!');
    } catch (error: any) {
      console.error('Error updating packing slip:', error);
      alert('Error updating packing slip. Please try again.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };
  const openDeletePopup = (slipId: string) => {
    setDeletePopup({ isOpen: true, slipId });
  };
  const closeDeletePopup = () => {
    setDeletePopup({ isOpen: false, slipId: undefined });
  };
  const handleDeleteConfirm = async () => {
    if (deletePopup.slipId) {
      await packingSlipAPI.deletePackingSlip(deletePopup.slipId);
      setDeletePopup({ isOpen: false, slipId: undefined });
      fetchPackingSlips();
    }
  };

  useEffect(() => {
    fetchPackingSlips();
  }, []);

  useEffect(() => {
    filterPackingSlips();
  }, [filterPackingSlips]);

  // Update filtered list when packingSlips changes
  useEffect(() => {
    if (packingSlips.length > 0) {
      console.log('PackingSlips changed, filtering...', packingSlips);
      filterPackingSlips();
    }
  }, [packingSlips, filters]);

  // Debug: Log filtered slips when they change
  useEffect(() => {
    console.log('FilteredSlips updated:', filteredSlips);
  }, [filteredSlips]);

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
            Packing Slip History
          </h1>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filters</h3>
            <div className="space-y-3">
              {/* Single Row with 4 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver
                  </label>
                  <input
                    type="text"
                    value={filters.receiverName}
                    onChange={(e) => handleFilterChange('receiverName', e.target.value)}
                    placeholder="Filter by receiver"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broker
                  </label>
                  <input
                    type="text"
                    value={filters.brokerName}
                    onChange={(e) => handleFilterChange('brokerName', e.target.value)}
                    placeholder="Filter by broker"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packing Slip Number
                  </label>
                  <input
                    type="text"
                    value={filters.packingSlipNumber}
                    onChange={(e) => handleFilterChange('packingSlipNumber', e.target.value)}
                    placeholder="Filter by slip number"
                    className="input-optimized px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
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

          {/* Packing Slips Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading packing slip history...</p>
              </div>
            ) : filteredSlips.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-600">No packing slips found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Packing Slip Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doc.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlips.map((slip, index) => (
                    <motion.tr
                      key={slip._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(slip.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {slip.packingSlipNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.receiverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.brokerName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {slip.items.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.courier ? (
                          <span className="text-gray-900">{slip.courier}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not dispatched</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slip.docNo ? (
                          <span className="text-gray-900">{slip.docNo}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not dispatched</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadPDF(slip._id!, slip.packingSlipNumber)}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Download PDF
                          </button>
                          <button
                            onClick={() => openDispatchPopup(slip._id!, slip.packingSlipNumber)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => openEditPopup(slip)}
                            className="text-yellow-600 hover:text-yellow-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeletePopup(slip._id!)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dispatch Popup */}
      {dispatchPopup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-md mx-4"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Dispatch Information
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Packing Slip: <span className="font-medium">{dispatchPopup.packingSlipNumber}</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Courier:
                </label>
                <input
                  type="text"
                  value={dispatchData.courier}
                  onChange={(e) => {
                    setDispatchData(prev => ({ ...prev, courier: e.target.value }));
                    if (validationErrors.courier) {
                      setValidationErrors(prev => ({ ...prev, courier: '' }));
                    }
                  }}
                  placeholder="Enter courier name"
                  className={`w-48 px-3 py-1 border rounded focus:outline-none focus:ring-1 ${
                    validationErrors.courier 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              {validationErrors.courier && (
                <p className="text-sm text-red-600 text-right">{validationErrors.courier}</p>
              )}

              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Doc.No:
                </label>
                <input
                  type="text"
                  value={dispatchData.docNo}
                  onChange={(e) => {
                    setDispatchData(prev => ({ ...prev, docNo: e.target.value }));
                    if (validationErrors.docNo) {
                      setValidationErrors(prev => ({ ...prev, docNo: '' }));
                    }
                  }}
                  placeholder="Enter document number"
                  className={`w-48 px-3 py-1 border rounded focus:outline-none focus:ring-1 ${
                    validationErrors.docNo 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
              {validationErrors.docNo && (
                <p className="text-sm text-red-600 text-right">{validationErrors.docNo}</p>
              )}
            </div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={closeDispatchPopup}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDispatchSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Dispatch
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Edit Modal Popup */}
      {editPopup.isOpen && editPopup.slip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Packing Slip</h2>
              <button
                onClick={closeEditPopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receiver <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.receiverName}
                      onChange={(e) => handleEditInputChange('receiverName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broker
                    </label>
                    <input
                      type="text"
                      value={editFormData.brokerName}
                      onChange={(e) => handleEditInputChange('brokerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Slip Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.packingSlipNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => handleEditInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier
                    </label>
                    <input
                      type="text"
                      value={editFormData.courier}
                      onChange={(e) => handleEditInputChange('courier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter courier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doc.No
                    </label>
                    <input
                      type="text"
                      value={editFormData.docNo}
                      onChange={(e) => handleEditInputChange('docNo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document number"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                  <button
                    type="button"
                    onClick={addEditItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add Item
                  </button>
                </div>

                {editItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items added. Click "Add Item" to add items.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sr. No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Design No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pieces</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.srNo}</td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.merchant}
                                onChange={(e) => updateEditItem(index, 'merchant', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="Merchant name"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.productionSampleType}
                                onChange={(e) => updateEditItem(index, 'productionSampleType', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="Paper Booklet, Hanger, etc."
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.designNo}
                                onChange={(e) => updateEditItem(index, 'designNo', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="Design number"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.totalPieces}
                                onChange={(e) => updateEditItem(index, 'totalPieces', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                min="1"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => removeEditItem(index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeEditPopup}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmittingEdit}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isSubmittingEdit || editItems.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-80 max-w-sm mx-2"
          >
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Deletion</h2>
            <p>Are you sure you want to delete this packing slip?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeDeletePopup} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PackingSlipHistory;
