import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const FinancialGoals = ({ goals }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Target}>Financial Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id}>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {goal.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goal.description}
            </p>
          </div>
        ))}
        <Button variant="link" className="p-0 h-auto text-sm mt-2">
          Set New Goal
        </Button>
      </CardContent>
    </Card>
  );
};