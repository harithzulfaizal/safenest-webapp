// src/components/features/profile/FinancialKnowledge.jsx
// Displays user's financial knowledge levels with actions
import React from 'react';
import { Info, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

// Added onAdd, onEdit, onDelete props
export const FinancialKnowledge = ({ knowledge, onAdd, onEdit, onDelete }) => {
  if (!knowledge) return <p>Loading financial knowledge...</p>;

  const knowledgeEntries = Object.entries(knowledge);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle icon={Info}>Financial Knowledge</CardTitle>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd} icon={PlusCircle} className="text-xs">
            Add Knowledge
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {knowledgeEntries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No financial knowledge areas assessed yet. Click "Add Knowledge" to get started.
          </p>
        ) : (
          knowledgeEntries.map(([key, value]) => {
            // Assuming 'key' is the category name as it's stored in UserContext
            // 'value' is an object like { level: "Level X", description: "..." }
            const category = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Format key for display

            return (
              <div key={key} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {category}:
                    <span className="text-gray-600 dark:text-gray-400 font-normal ml-1">{value.level}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                    {value.description}
                  </p>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex space-x-1 flex-shrink-0 ml-2 mt-0.5">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit({ category: key, ...value })} // Pass category and current value
                        className="p-1 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                        aria-label={`Edit ${category}`}
                      >
                        <Edit2 size={16} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(key)} // Pass category (key) for deletion
                        className="p-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                        aria-label={`Delete ${category}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
