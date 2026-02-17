import React from 'react';
import type { NextPage } from 'next';
import ViewQRs from '../src/components/ViewQRs';

import ProtectedRoute from '../src/components/ProtectedRoute';

const ViewQRsPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <ViewQRs />
    </ProtectedRoute>
  );
};

export default ViewQRsPage;
