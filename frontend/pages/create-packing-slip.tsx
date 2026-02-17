import React from 'react';
import type { NextPage } from 'next';
import CreatePackingSlip from '../src/components/CreatePackingSlip';

import ProtectedRoute from '../src/components/ProtectedRoute';

const CreatePackingSlipPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <CreatePackingSlip />
    </ProtectedRoute>
  );
};

export default CreatePackingSlipPage;
