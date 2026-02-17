import React from 'react';
import type { NextPage } from 'next';
import ReceiverHistory from '../src/components/ReceiverHistory';

import ProtectedRoute from '../src/components/ProtectedRoute';

const ReceiverHistoryPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <ReceiverHistory />
    </ProtectedRoute>
  );
};

export default ReceiverHistoryPage;
