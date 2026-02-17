import React from 'react';
import type { NextPage } from 'next';
import CreateSample from '../src/components/CreateSample';

import ProtectedRoute from '../src/components/ProtectedRoute';

const CreateSamplePage: NextPage = () => {
  return (
    <ProtectedRoute>
      <CreateSample />
    </ProtectedRoute>
  );
};

export default CreateSamplePage;
