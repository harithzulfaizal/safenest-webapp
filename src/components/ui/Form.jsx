// src/components/ui/Form.jsx
// Reusable form components
import React from 'react';

export const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

export const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ${className}`}>
    {children}
  </label>
);

export const Select = ({ children, value, onChange, className = '', ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`h-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${className}`}
    {...props}
  >
    {children}
  </select>
);
