import React, { createContext, useState, useContext } from 'react';
import { mockUserProfile } from '../data/mockData';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(mockUserProfile);
  
  // Context values to be provided
  const value = {
    user,
    setUser
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook for accessing the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};