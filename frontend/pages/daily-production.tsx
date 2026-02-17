import React from 'react';
import type { NextPage } from 'next';
import DailyProduction from '../src/components/DailyProduction';

import ProtectedRoute from '../src/components/ProtectedRoute';

const DailyProductionPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <DailyProduction />
    </ProtectedRoute>
  );
};

export default DailyProductionPage;
