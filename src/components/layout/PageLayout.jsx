import React from 'react';
import { Navigation } from './Navigation';

export const PageLayout = ({ 
  children, 
  currentPage, 
  setCurrentPage, 
  userProfile, 
  onLogout 
}) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        userProfile={userProfile}
        onLogout={onLogout}
      />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};