// src/components/features/profile/PersonalDetails.jsx
// Displays user's personal details and financial goals
import React from 'react';
import { DollarSign, Briefcase, Users, ShieldCheck, User as UserIconLucide, Target, CalendarIcon } from 'lucide-react'; // Added Target for goals, CalendarIcon for Age
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';
import { Button } from '../../ui/Button'; // For a potential "Edit" button linking to the main modal

export const PersonalDetails = ({ personalDetails, financialGoals, onEditProfileAndGoals }) => {
  if (!personalDetails) return <p>Loading personal details...</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle icon={UserIconLucide}>Personal Details</CardTitle>
        {onEditProfileAndGoals && (
            <Button variant="outline" size="sm" onClick={onEditProfileAndGoals}>
                Edit Details & Goals
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
                        icon={CalendarIcon} // Using CalendarIcon for age
                    />
                )}
                <DetailItem
                    label="Net Household Income"
                    value={personalDetails.netHouseholdIncome}
                    icon={DollarSign}
                />
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

        {/* Financial Goals Section */}
        {financialGoals && (
            <div>
                <hr className="my-6 border-gray-200 dark:border-gray-700" />
                <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Financial Goals
                </h4>
                {financialGoals.length > 0 ? (
                    <div className="space-y-3">
                    {financialGoals.map(goal => (
                        <div key={goal.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {goal.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 whitespace-pre-wrap">
                                {goal.description}
                            </p>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No financial goals set yet. Click "Edit Details & Goals" to add them.
                    </p>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};
