import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateSample from './pages/CreateSample';
import StockStatus from './pages/StockStatus';
import CreatePackingSlip from './pages/CreatePackingSlip';
import ViewQRs from './pages/ViewQRs';
import DailyProduction from './pages/DailyProduction';
import PackingSlipHistory from './pages/PackingSlipHistory';
import ReceiverHistory from './pages/ReceiverHistory';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-sample" element={<CreateSample />} />
            <Route path="/stock-status" element={<StockStatus />} />
            <Route path="/create-packing-slip" element={<CreatePackingSlip />} />
            <Route path="/view-qrs" element={<ViewQRs />} />
            <Route path="/daily-production" element={<DailyProduction />} />
            <Route path="/packing-slip-history" element={<PackingSlipHistory />} />
            <Route path="/receiver-history" element={<ReceiverHistory />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
