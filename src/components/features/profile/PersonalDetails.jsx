// src/components/features/profile/PersonalDetails.jsx
// Displays user's personal details, income sources, and financial goals
import React from 'react';
import {
  DollarSign,
  Briefcase,
  Users,
  ShieldCheck,
  User as UserIconLucide,
  Target,
  CalendarDays,
  Heart, // Example icon for Gender, choose as appropriate
} from 'lucide-react'; // Removed Edit2, Trash2, PlusCircle as direct actions are removed
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../../utils/formatters';

export const PersonalDetails = ({
  personalDetails,
  incomeSources, // Expects an array of income objects: [{ income_id, income_source, monthly_income, description }, ...]
  financialGoals,
  onEditProfileAndGoals, // This will now open the consolidated EditProfileModal
  // Removed onAddIncome, onEditIncome, onDeleteIncome as they are handled in EditProfileModal
}) => {
  if (!personalDetails) return <p>Loading personal details...</p>;

  // Calculate total monthly income for display
  const totalMonthlyIncome = incomeSources?.reduce((sum, source) => sum + parseFloat(source.monthly_income || 0), 0) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle icon={UserIconLucide}>Personal & Financial Overview</CardTitle>
        {onEditProfileAndGoals && (
            <Button variant="outline" size="sm" onClick={onEditProfileAndGoals}>
              Edit Profile, Income & Goals
            </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">About You</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {personalDetails.age && personalDetails.age !== 'N/A' && (
              <DetailItem
                label="Age"
                value={personalDetails.age}
                icon={CalendarDays}
              />
            )}
            {personalDetails.gender && personalDetails.gender !== 'N/A' && (
              <DetailItem
                label="Gender"
                value={personalDetails.gender}
                icon={Heart} // Placeholder icon, choose something appropriate
              />
            )}
            <DetailItem
              label="Employment Status"
              value={personalDetails.employmentStatus}
              icon={Briefcase}
            />
            <DetailItem
              label="Household Composition"
              value={`${personalDetails.householdComposition?.dependentAdults || 0} Adult(s), ${personalDetails.householdComposition?.dependentChildren || 0} Child(ren)`}
              icon={Users}
            />
            <DetailItem
              label="Emergency Fund Savings Level"
              value={personalDetails.emergencyFundSavingsLevel}
              icon={ShieldCheck}
            />
          </div>
        </div>

        {/* Income Sources Section - View Only */}
        <div>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              Income Sources (Total: {formatCurrency(totalMonthlyIncome)}/month)
            </h4>
            {/* "Add Income" button is removed, handled in the main EditProfileModal */}
          </div>
          {incomeSources && incomeSources.length > 0 ? (
            <div className="space-y-3">
              {incomeSources.map(income => (
                <div key={income.income_id || income.tempId} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {income.income_source || "Unnamed Source"}
                      <span className="text-gray-700 dark:text-gray-300 font-normal ml-2">
                        ({formatCurrency(income.monthly_income)})
                      </span>
                    </p>
                    {income.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 whitespace-pre-wrap">
                        {income.description}
                      </p>
                    )}
                  </div>
                  {/* Edit/Delete buttons are removed from here */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No income sources listed. Click "Edit Profile, Income & Goals" to add them.
            </p>
          )}
        </div>

        {/* Financial Goals Section - View Only */}
        {/* Financial goals are now sorted by priority from UserContext */}
        {financialGoals && (
          <div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
            <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
              <Target className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Financial Goals (Prioritized)
            </h4>
            {financialGoals.length > 0 ? (
              <div className="space-y-3">
                {financialGoals.map((goal, index) => ( // Goals are already sorted
                  <div key={goal.id || `goal-${index}`} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                    <div className="flex items-start">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2 mt-1 p-1 bg-blue-100 dark:bg-blue-700/30 rounded-full w-6 h-6 flex items-center justify-center">{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {goal.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 whitespace-pre-wrap">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No financial goals set yet. Click "Edit Profile, Income & Goals" to add and prioritize them.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
