// src/components/layout/PageLayout.jsx
// Main layout structure for authenticated pages
import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Menu, X } from 'lucide-react'; // For mobile menu toggle

export const PageLayout = ({
  children,
  currentPage,
  setCurrentPage,
  userProfile,
  onLogout
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      {/* Mobile Nav Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-200 dark:bg-gray-700 rounded-md"
        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        aria-label="Toggle navigation"
      >
        {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Navigation - Conditional rendering for mobile */}
      <div className={`fixed inset-y-0 left-0 z-10 transform ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0 h-full`}>
        <Navigation
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            setIsMobileNavOpen(false); // Close mobile nav on item click
          }}
          userProfile={userProfile}
          onLogout={onLogout}
        />
      </div>
      
      {/* Overlay for mobile nav */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        ></div>
      )}


      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Add a top margin for mobile to prevent content from being under a potential fixed header if toggle was there */}
        <div className="md:mt-0 mt-16"> 
          {children}
        </div>
      </main>
    </div>
  );
};
