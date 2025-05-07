// src/App.jsx
// Main application component, handles routing and layout
import React, { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { InsightsPage } from './pages/InsightsPage';
import { TransactionsPage } from './pages/TransactionsPage';
// Placeholder for HelpPage - create this file if you intend to use it
// import { HelpPage } from './pages/HelpPage';
import { PageLayout } from './components/layout/PageLayout';
import { useAuth } from './context/AuthContext';
import { useUser } from './context/UserContext';
import { Card, CardContent } from './components/ui/Card'; // For loading display

const App = () => {
  const { isLoggedIn, logout, isLoadingAuth } = useAuth();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState('profile'); // Default page

  // Function to get current page from hash or default
  const getPageFromHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    // Define valid pages to prevent arbitrary hash values from breaking the app
    const validPages = ['profile', 'insights', 'transactions', 'help'];
    if (validPages.includes(hash)) {
      return hash;
    }
    return 'profile'; // Default to profile if hash is invalid or empty
  }, []);

  // Effect for initializing and handling hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };

    // Set initial page based on hash
    setCurrentPage(getPageFromHash());

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [getPageFromHash]);

  // Effect to update hash when currentPage state changes
  useEffect(() => {
    if (isLoggedIn && window.location.hash.replace('#', '') !== currentPage) {
      window.location.hash = currentPage;
    }
  }, [currentPage, isLoggedIn]);


  // Handle navigation selection
  const handleSetCurrentPage = (page) => {
    setCurrentPage(page);
    // Hash will be updated by the useEffect listening to currentPage
  };

  if (isLoadingAuth) {
    // Show a global loading indicator while checking auth status
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-xs">
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300">Initializing...</p>
            {/* You can add a spinner here */}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />;
      case 'insights':
        return <InsightsPage />;
      case 'transactions':
        return <TransactionsPage />;
      // case 'help': // Uncomment if HelpPage.jsx is created
      //   return <HelpPage />;
      default:
        // This case should ideally not be reached if getPageFromHash is robust
        console.warn(`Unknown page: ${currentPage}, redirecting to profile.`);
        setCurrentPage('profile'); // Reset to a known page
        return <ProfilePage />;
    }
  };

  return (
    <PageLayout
      currentPage={currentPage}
      setCurrentPage={handleSetCurrentPage} // Use the new handler
      userProfile={user}
      onLogout={logout}
    >
      {renderPage()}
    </PageLayout>
  );
};

export default App;
