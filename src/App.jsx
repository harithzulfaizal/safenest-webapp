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
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState('profile');

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
      default:
        return <ProfilePage />;
    }
  };

  return (
    <PageLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userProfile={user}
      onLogout={logout}
    >
      {renderPage()}
    </PageLayout>
  );
};

export default App;