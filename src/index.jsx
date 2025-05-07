// src/index.jsx
// Entry point of the React application
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import './styles/globals.css'; // Main stylesheet

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // <React.StrictMode>
      <AuthProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </AuthProvider>
    // </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Ensure your HTML has an element with id='root'.");
}
