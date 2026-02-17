import React from 'react';
import type { NextPage } from 'next';
import PackingSlipHistory from '../src/components/PackingSlipHistory';

import ProtectedRoute from '../src/components/ProtectedRoute';

const PackingSlipHistoryPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <PackingSlipHistory />
    </ProtectedRoute>
  );
};

export default PackingSlipHistoryPage;
