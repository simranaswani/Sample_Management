import React from 'react';
import type { NextPage } from 'next';
import Home from '../src/components/Home';

import ProtectedRoute from '../src/components/ProtectedRoute';

const IndexPage: NextPage = () => {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
};

export default IndexPage;
