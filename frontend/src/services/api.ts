import axios from 'axios';
import { Sample, PackingSlip } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sample API calls
export const sampleAPI = {
  createSamples: (samples: Omit<Sample, '_id' | 'qrCodeId' | 'dateCreated'>[]) =>
    api.post('/samples', { samples }),
  
  getAllSamples: () => api.get('/samples'),
  
  getSampleById: (id: string) => api.get(`/samples/${id}`),
  
  getSampleByQR: (qrCodeId: string) => api.get(`/samples/qr/${qrCodeId}`),
  
  getSamplesByDate: (date: string) => api.get(`/samples/by-date/${date}`),
  
  getStockSummary: (params?: { merchant?: string; startDate?: string; endDate?: string }) =>
    api.get('/samples/aggregate/stock', { params }),
  
  updateSample: (id: string, data: Partial<Sample>) => api.put(`/samples/${id}`, data),
  
  deleteSample: (id: string) => api.delete(`/samples/${id}`),
};

// Packing Slip API calls
export const packingSlipAPI = {
  createPackingSlip: (data: Omit<PackingSlip, '_id'>) => api.post('/packing-slips', data),
  
  getAllPackingSlips: () => api.get('/packing-slips'),
  
  getPackingSlipById: (id: string) => api.get(`/packing-slips/${id}`),
  
  generatePDF: (id: string) => api.get(`/packing-slips/${id}/pdf`, { responseType: 'blob' }),
  
  updatePackingSlip: (id: string, data: Partial<PackingSlip>) => api.put(`/packing-slips/${id}`, data),
  
  deletePackingSlip: (id: string) => api.delete(`/packing-slips/${id}`),
};

export default api;

