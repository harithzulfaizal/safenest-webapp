// src/components/features/DetailItem.jsx
// Component to display a label and value, optionally with an icon
import React from 'react';
import { Label } from '../ui/Form';

export const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start">
    {Icon && <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />}
    <div>
      <Label className="mb-0">{label}</Label>
      <p className="text-sm text-gray-900 dark:text-white">{String(value)}</p> {/* Ensure value is string */}
    </div>
  </div>
);
