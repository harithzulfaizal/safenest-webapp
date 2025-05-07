// src/components/features/profile/FinancialProfile.jsx
// Displays user's overall financial profile summary, hiding "N/A" values.
import React from 'react';
import { Wallet, Landmark, TrendingDown, BarChartHorizontalBig, Percent, PiggyBank, ShieldAlert, ListChecks, CreditCard, PieChart as PieChartIcon } from 'lucide-react'; // Removed FileText as it was for the removed list
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';
import { formatCurrency } from '../../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define some colors for the pie chart
const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A52A2A', '#D2691E', '#FFD700'];

// Helper function to check if a value is valid for display
const isValidValue = (value) => {
  return value !== null && value !== undefined && value !== 'N/A' && String(value).trim() !== '';
};

export const FinancialProfile = ({ profile }) => {
  if (!profile) return <p>Loading financial profile...</p>;

  // Prepare data for the pie chart from the latest month's summary
  const latestMonthExpenseData = profile.spendingHabit?.expenseSummaryForLatestMonth 
    ? Object.entries(profile.spendingHabit.expenseSummaryForLatestMonth)
        .map(([name, value]) => ({ name, value: Math.abs(value) })) // Use absolute value for chart
        .filter(item => item.value > 0) // Only include categories with spending
        .sort((a,b) => b.value - a.value) // Sort for consistent legend/colors
    : [];
  
  const latestMonthDisplay = profile.spendingHabit?.latestMonthForSummary 
    ? new Date(profile.spendingHabit.latestMonthForSummary + '-02').toLocaleDateString(undefined, {year: 'numeric', month: 'long'})
    : "latest month";

  // Prepare Financial Overview items
  const overviewItemsRaw = [
    { label: "Net Worth", value: profile.netWorth, icon: null }, // Icon handled by section title
    { label: "Assets", value: profile.assets, icon: PiggyBank },
    { label: "Savings Amount", value: profile.savingsAmount, icon: null }, // Can re-add PiggyBank if desired
    { label: "Liabilities", value: profile.liabilities, icon: TrendingDown },
    { label: "Total Debt", value: profile.totalDebt, icon: null }, // Can re-add TrendingDown
    { label: "Debt-to-Income (DTI)", value: profile.dti, icon: Percent },
  ];
  const validOverviewItems = overviewItemsRaw.filter(item => isValidValue(item.value));

  // Prepare Spending & Savings Habits items
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

        {/* Debt Details Section - already conditional */}
        {profile.detailedDebts && profile.detailedDebts.length > 0 && (
          <>
            {validOverviewItems.length > 0 && <hr className="my-4 border-gray-200 dark:border-gray-700" />}
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Debt Accounts ({profile.numberOfDebtAccounts}) {/* Count is not "N/A", so it's fine */}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {profile.detailedDebts.map((debt) => (
                  // Assuming debt.name and debt.amount are always valid if the array exists
                  <DetailItem 
                    key={debt.id || debt.name} 
                    label={debt.name} 
                    value={formatCurrency(debt.amount)} 
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Spending & Savings Habits Section */}
        {validHabitsItems.length > 0 && (
          <>
            {(validOverviewItems.length > 0 || (profile.detailedDebts && profile.detailedDebts.length > 0)) && 
              <hr className="my-4 border-gray-200 dark:border-gray-700" />}
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

        {/* Expense Distribution Pie Chart Section - already conditional */}
        {latestMonthExpenseData.length > 0 && (
          <>
            {(validOverviewItems.length > 0 || (profile.detailedDebts && profile.detailedDebts.length > 0) || validHabitsItems.length > 0) &&
              <hr className="my-4 border-gray-200 dark:border-gray-700" />}
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
         (!profile.detailedDebts || profile.detailedDebts.length === 0) && 
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
