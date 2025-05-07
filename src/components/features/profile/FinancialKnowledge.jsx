// src/components/features/profile/FinancialKnowledge.jsx
// Displays user's financial knowledge levels
import React from 'react';
import { Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

export const FinancialKnowledge = ({ knowledge }) => {
  if (!knowledge || Object.keys(knowledge).length === 0) return <p>Loading financial knowledge...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Info}>Financial Knowledge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(knowledge).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {key.replace(/([A-Z])/g, ' $1')}:
              <span className="text-gray-600 dark:text-gray-400 font-normal"> {value.level}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {value.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
