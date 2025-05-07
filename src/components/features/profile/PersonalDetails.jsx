// src/components/features/profile/PersonalDetails.jsx
// Displays user's personal details, income sources, and financial goals
import React from 'react';
import { DollarSign, Briefcase, Users, ShieldCheck, User as UserIconLucide, Target, CalendarIcon, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../../utils/formatters'; // For formatting income amounts

export const PersonalDetails = ({
  personalDetails,
  incomeSources, // Expects an array of income objects: [{ income_id, income_source, monthly_income, description }, ...]
  financialGoals,
  onEditProfileAndGoals,
  onAddIncome, // New prop
  onEditIncome,  // New prop
  onDeleteIncome // New prop
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
                Edit Profile & Goals
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
                        icon={CalendarIcon}
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
                    value={personalDetails.emergencyFundSavingsLevel} // This might need recalculation based on actual savings vs expenses
                    icon={ShieldCheck}
                />
            </div>
        </div>

        {/* Income Sources Section */}
        <div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                    Income Sources (Total: {formatCurrency(totalMonthlyIncome)}/month)
                </h4>
                {onAddIncome && (
                    <Button variant="outline" size="sm" onClick={onAddIncome} icon={PlusCircle} className="text-xs">
                        Add Income
                    </Button>
                )}
            </div>
            {incomeSources && incomeSources.length > 0 ? (
                <div className="space-y-3">
                    {incomeSources.map(income => (
                        <div key={income.income_id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-start">
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
                            <div className="flex space-x-1 flex-shrink-0 ml-2 mt-0.5">
                                {onEditIncome && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEditIncome(income)}
                                        className="p-1 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                                        aria-label={`Edit ${income.income_source}`}
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                )}
                                {onDeleteIncome && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeleteIncome(income.income_id)}
                                        className="p-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                                        aria-label={`Delete ${income.income_source}`}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No income sources listed. Click "Add Income" to add one.
                </p>
            )}
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
                        No financial goals set yet. Click "Edit Profile & Goals" to add them.
                    </p>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};
