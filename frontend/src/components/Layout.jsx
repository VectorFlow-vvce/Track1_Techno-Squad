// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Correct path: './' means 'in the same folder'
import Footer from './Footer'; // Correct path: './' means 'in the same folder'

const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* The Outlet component renders the current page (Home, About, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;