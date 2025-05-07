// src/context/AuthContext.jsx
// Manages authentication state and basic authenticated user info
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Store basic info of the authenticated user (e.g., id, email from login response)
  const [authenticatedUser, setAuthenticatedUser] = useState(null); // e.g., { userId: 1, email: 'user@example.com' }

  // Modified login function to accept user data from the login API response
  const login = (userData) => {
    // userData is expected to be an object like { userId: ..., email: ... }
    // This should come from the /auth/login API response
    setAuthenticatedUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthenticatedUser(null); // Clear user info on logout
  };

  const value = {
    isLoggedIn,
    authenticatedUser, // Provide authenticatedUser to consumers
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
