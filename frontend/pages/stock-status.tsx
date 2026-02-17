import React from 'react';
import type { NextPage } from 'next';
import StockStatus from '../src/components/StockStatus';

import ProtectedRoute from '../src/components/ProtectedRoute';

const StockStatusPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <StockStatus />
    </ProtectedRoute>
  );
};

export default StockStatusPage;
