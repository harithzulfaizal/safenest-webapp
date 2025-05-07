// src/App.jsx
// Main application component, handles routing and layout
import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { InsightsPage } from './pages/InsightsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { PageLayout } from './components/layout/PageLayout';
import { useAuth } from './context/AuthContext';
import { useUser } from './context/UserContext';

const App = () => {
  const { isLoggedIn, logout } = useAuth();
  const { user } = useUser(); // User data from context
  const [currentPage, setCurrentPage] = useState('profile'); // Default page

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
      // Add case for 'help' if you create a HelpPage.jsx
      // case 'help':
      //   return <HelpPage />;
      default:
        // Fallback to profile or a dedicated "not found" page
        console.warn(`Unknown page: ${currentPage}, redirecting to profile.`);
        setCurrentPage('profile'); // Reset to a known page
        return <ProfilePage />;
    }
  };

  return (
    <PageLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userProfile={user} // Pass the user object from UserContext
      onLogout={logout}
    >
      {renderPage()}
    </PageLayout>
  );
};

export default App;
