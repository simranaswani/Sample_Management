import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../src/index.css';
import Navbar from '../src/components/Navbar';

import { AuthProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Component {...pageProps} />
        </motion.main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
