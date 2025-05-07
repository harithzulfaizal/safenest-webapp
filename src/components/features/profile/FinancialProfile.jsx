// src/components/features/profile/FinancialProfile.jsx
// Displays user's overall financial profile summary, with actions for debts.
import React from 'react';
import { Wallet, Landmark, TrendingDown, BarChartHorizontalBig, Percent, PiggyBank, ShieldAlert, CreditCard, PieChart as PieChartIcon, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { DetailItem } from '../DetailItem';
import { formatCurrency } from '../../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define some colors for the pie chart
const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#D2691E', '#FFD700'];

// Helper function to check if a value is valid for display
const isValidValue = (value) => {
  return value !== null && value !== undefined && value !== 'N/A' && String(value).trim() !== '';
};

// Added onAddDebt, onEditDebt, onDeleteDebt props
export const FinancialProfile = ({ profile, onAddDebt, onEditDebt, onDeleteDebt }) => {
  if (!profile) return <p>Loading financial profile...</p>;

  const latestMonthExpenseData = profile.spendingHabit?.expenseSummaryForLatestMonth
    ? Object.entries(profile.spendingHabit.expenseSummaryForLatestMonth)
        .map(([name, value]) => ({ name, value: Math.abs(value) }))
        .filter(item => item.value > 0)
        .sort((a,b) => b.value - a.value)
    : [];

  const latestMonthDisplay = profile.spendingHabit?.latestMonthForSummary
    ? new Date(profile.spendingHabit.latestMonthForSummary + '-02').toLocaleDateString(undefined, {year: 'numeric', month: 'long'})
    : "latest month";

  const overviewItemsRaw = [
    { label: "Net Worth", value: profile.netWorth, icon: null },
    { label: "Assets", value: profile.assets, icon: PiggyBank },
    { label: "Savings Amount", value: profile.savingsAmount, icon: null },
    { label: "Liabilities", value: profile.liabilities, icon: TrendingDown },
    { label: "Total Debt", value: profile.totalDebt, icon: null },
    { label: "Debt-to-Income (DTI)", value: profile.dti, icon: Percent },
  ];
  const validOverviewItems = overviewItemsRaw.filter(item => isValidValue(item.value));

  const habitsItemsRaw = [
    { label: "Top Spending Category", value: profile.spendingHabit?.topCategory, icon: null },
    { label: "Spending Style", value: profile.spendingHabit?.style, icon: null },
    { label: "Savings Rate", value: profile.savingsHabit?.savingsRate, icon: null },
    { label: "Emergency Fund Status", value: profile.savingsHabit?.emergencyFundStatus, icon: ShieldAlert },
  ];
  const validHabitsItems = habitsItemsRaw.filter(item => isValidValue(item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Wallet}>Financial Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Core Financials Section */}
        {validOverviewItems.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
              <Landmark className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Financial Overview
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {validOverviewItems.map(item => (
                <DetailItem key={item.label} label={item.label} value={item.value} icon={item.icon} />
              ))}
            </div>
          </div>
        )}

        {/* Debt Details Section */}
        {/* This section will always render if onAddDebt is provided, to show the "Add Debt" button,
            even if there are no current debts. */}
        {(profile.detailedDebts && profile.detailedDebts.length > 0) || onAddDebt ? (
          <>
            {validOverviewItems.length > 0 && <hr className="my-6 border-gray-200 dark:border-gray-700" />}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Debt Accounts ({profile.numberOfDebtAccounts || 0})
                </h4>
                {onAddDebt && (
                  <Button variant="outline" size="sm" onClick={onAddDebt} icon={PlusCircle} className="text-xs">
                    Add Debt
                  </Button>
                )}
              </div>
              {profile.detailedDebts && profile.detailedDebts.length > 0 ? (
                <div className="space-y-3">
                  {profile.detailedDebts.map((debt) => (
                    <div key={debt.id || debt.name} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{debt.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Balance: {formatCurrency(debt.amount)}
                          {debt.interest_rate && ` | Rate: ${(parseFloat(debt.interest_rate) * 100).toFixed(2)}%`}
                        </p>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0 ml-2">
                        {onEditDebt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditDebt(debt)} // Pass the full debt object
                            className="p-1 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                            aria-label="Edit debt"
                          >
                            <Edit2 size={16} />
                          </Button>
                        )}
                        {onDeleteDebt && (
                           <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteDebt(debt.id)} // Pass debt.id (which is debt_id)
                            className="p-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                            aria-label="Delete debt"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                onAddDebt && <p className="text-sm text-gray-500 dark:text-gray-400">No debt accounts listed. Click "Add Debt" to add one.</p>
              )}
            </div>
          </>
        ) : null}


        {/* Spending & Savings Habits Section */}
        {validHabitsItems.length > 0 && (
          <>
            {(validOverviewItems.length > 0 || (profile.detailedDebts && profile.detailedDebts.length > 0) || onAddDebt) &&
              <hr className="my-6 border-gray-200 dark:border-gray-700" />}
            <div>
                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                    <BarChartHorizontalBig className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Spending & Savings Habits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {validHabitsItems.map(item => (
                    <DetailItem key={item.label} label={item.label} value={item.value} icon={item.icon} />
                ))}
                </div>
            </div>
          </>
        )}

        {/* Expense Distribution Pie Chart Section */}
        {latestMonthExpenseData.length > 0 && (
          <>
            {(validOverviewItems.length > 0 || (profile.detailedDebts && profile.detailedDebts.length > 0) || onAddDebt || validHabitsItems.length > 0) &&
              <hr className="my-6 border-gray-200 dark:border-gray-700" />}
            <div className="flex flex-col items-center">
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Spending Distribution ({latestMonthDisplay})
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={latestMonthExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {latestMonthExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    wrapperStyle={{fontSize: '0.8rem', paddingTop: '10px'}}
                    align="center"
                    layout="horizontal"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Fallback message if no sections have any valid data to show */}
        {validOverviewItems.length === 0 &&
         (!profile.detailedDebts || profile.detailedDebts.length === 0) && !onAddDebt && // Only show if not even AddDebt is possible
         validHabitsItems.length === 0 &&
         latestMonthExpenseData.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No financial profile details available to display at the moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
