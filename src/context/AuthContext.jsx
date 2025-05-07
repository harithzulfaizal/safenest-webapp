// src/context/AuthContext.jsx
// Manages authentication state and basic authenticated user info
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'safeNestAuthData'; // Key for localStorage

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To track initial auth check

  useEffect(() => {
    // Check localStorage for existing auth data on initial load
    try {
      const storedAuthData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuthData) {
        const authData = JSON.parse(storedAuthData);
        if (authData && authData.userId && authData.email) {
          setAuthenticatedUser(authData);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Error reading auth data from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoadingAuth(false); // Finished initial auth check
  }, []);

  const login = (userData) => {
    // userData is expected to be an object like { userId: ..., email: ... }
    if (userData && userData.userId && userData.email) {
      setAuthenticatedUser(userData);
      setIsLoggedIn(true);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error("Error saving auth data to localStorage:", error);
      }
    } else {
      console.warn("Login attempt with invalid userData:", userData);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthenticatedUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing auth data from localStorage:", error);
    }
  };

  const value = {
    isLoggedIn,
    authenticatedUser,
    login,
    logout,
    isLoadingAuth, // Expose loading state for initial auth check
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
