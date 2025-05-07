// src/components/ui/Card.jsx
// Reusable card components
import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '', icon: Icon }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white flex items-center ${className}`}>
    {Icon && <Icon className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />}
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Added CardFooter component
export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);
