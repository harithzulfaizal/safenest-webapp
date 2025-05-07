// src/context/UserContext.jsx
// Provides user data to components, fetched from the backend API
import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_USER_ID } from '../apiConfig';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from './AuthContext';

const UserContext = createContext();

// Helper to transform API financial knowledge list to object
const transformFinancialKnowledge = (knowledgeList) => {
  if (!knowledgeList || knowledgeList.length === 0) return {};
  return knowledgeList.reduce((acc, item) => {
    const key = item.category.toLowerCase()
      .replace(/\s*&\s*|\s+/g, (match) => match.trim() === '&' ? 'And' : '')
      .replace(/^(.)/, c => c.toLowerCase())
      .replace(/And(.)/, c => c[3].toUpperCase());
    acc[key] = {
      level: `Level ${item.level}`,
      description: item.description,
    };
    return acc;
  }, {});
};

// Helper to transform API goals object to array
const transformGoals = (apiGoals) => {
  if (!apiGoals || typeof apiGoals !== 'object' || Object.keys(apiGoals).length === 0) {
    return [];
  }
  return Object.entries(apiGoals).map(([key, value]) => {
    if (typeof value === 'object' && value.title && value.description) {
      return { id: key, title: value.title, description: value.description };
    }
    if (typeof value === 'string') {
      return { id: key, title: key.replace(/([A-Z])/g, ' $1').trim(), description: value };
    }
    return { id: key, title: "Goal", description: "Details missing in API response" };
  });
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    memberSince: '2023-01-15',
    accountType: 'Premium',
    personalDetails: {
      netHouseholdIncome: 'N/A',
      employmentStatus: 'N/A',
      householdComposition: { dependentAdults: 0, dependentChildren: 0 },
      emergencyFundSavingsLevel: 'N/A',
    },
    financialGoals: [],
    financialKnowledge: {},
    financialProfile: {
      netWorth: 'N/A',
      assets: 'N/A',
      savingsAmount: 'N/A',
      liabilities: 'N/A',
      totalDebt: 'N/A',
      numberOfDebtAccounts: 0,
      detailedDebts: [], // Added for individual debt display
      dti: 'N/A',
      spendingHabit: {
        topCategory: 'N/A',
        style: 'N/A',
        expenseSummary: {}, // Original summary based on monthly_amount
        expenseSummaryForLatestMonth: {}, // Added for latest month's actuals
        latestMonthForSummary: null, // Added to store which month is summarized
      },
      savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users/${DEFAULT_USER_ID}/comprehensive_details`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}`}));
          throw new Error(`Failed to fetch user data: ${response.status} - ${errorData.detail}`);
        }
        const data = await response.json();

        // --- Process Expenses for Latest Month ---
        let expenseSummaryForLatestMonth = {};
        let latestMonthForSummary = null;
        if (data.expenses && data.expenses.length > 0) {
          const expensesWithDates = data.expenses.map(exp => {
            // Ensure monthly_amount is a number, default to 0 if not.
            // This amount is treated as the actual transaction amount.
            const amount = parseFloat(String(exp.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
            return {
              ...exp,
              date: exp.timestamp ? new Date(exp.timestamp) : null,
              amount: isNaN(amount) ? 0 : amount,
            };
          }).filter(exp => exp.date instanceof Date && !isNaN(exp.date)); // Filter out invalid dates

          if (expensesWithDates.length > 0) {
            // Sort by date descending to find the latest month easily
            expensesWithDates.sort((a, b) => b.date - a.date);
            const latestDate = expensesWithDates[0].date;
            const latestYear = latestDate.getFullYear();
            const latestMonthNum = latestDate.getMonth(); // 0-indexed

            latestMonthForSummary = `${latestYear}-${String(latestMonthNum + 1).padStart(2, '0')}`; // YYYY-MM format

            // Filter expenses for that latest month and year
            const latestMonthExpenses = expensesWithDates.filter(exp =>
              exp.date.getFullYear() === latestYear && exp.date.getMonth() === latestMonthNum
            );

            // Summarize by category for the latest month
            expenseSummaryForLatestMonth = latestMonthExpenses.reduce((acc, curr) => {
              const category = curr.expense_category || 'Uncategorized';
              acc[category] = (acc[category] || 0) + curr.amount; // Summing the actual transaction amount
              return acc;
            }, {});
          }
        }
        // --- End Process Expenses for Latest Month ---

        // Original summary (can be kept or removed based on need)
        const originalExpenseSummary = data.expenses && data.expenses.length > 0 ?
          data.expenses.reduce((acc, curr) => {
            const category = curr.expense_category || 'Uncategorized';
            const amount = parseFloat(String(curr.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
            acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
            return acc;
          }, {}) : {};

        const transformedUser = {
          ...user,
          name: data.profile?.name || user.name,
          email: data.profile?.email || user.email,
          personalDetails: {
            netHouseholdIncome: data.income && data.income.length > 0
              ? formatCurrency(data.income.reduce((sum, item) => sum + parseFloat(String(item.monthly_income || '0').replace(/[^0-9.-]+/g,"")), 0)) + ' monthly'
              : 'N/A',
            employmentStatus: data.profile?.retirement_status === "Employed" ? "Full-time" : data.profile?.retirement_status || "N/A",
            householdComposition: {
              dependentAdults: 0,
              dependentChildren: data.profile?.num_children || 0,
            },
            emergencyFundSavingsLevel: 'N/A',
          },
          financialGoals: data.profile?.goals ? transformGoals(data.profile.goals) : [],
          financialKnowledge: transformFinancialKnowledge(data.financial_knowledge),
          financialProfile: {
            netWorth: 'N/A',
            assets: 'N/A',
            savingsAmount: 'N/A',
            liabilities: data.debts && data.debts.length > 0
              ? formatCurrency(data.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g,"")), 0))
              : formatCurrency(0),
            totalDebt: data.debts && data.debts.length > 0
              ? formatCurrency(data.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g,"")), 0))
              : formatCurrency(0),
            numberOfDebtAccounts: data.debts ? data.debts.length : 0,
            detailedDebts: data.debts ? data.debts.map(d => ({ // Store detailed debts
                id: d.debt_id,
                name: d.account_name || 'N/A',
                // Ensure current_balance is a number for calculations, format for display later
                amount: parseFloat(String(d.current_balance || '0').replace(/[^0-9.-]+/g,"")),
                interest_rate: d.interest_rate, // Keep as is, or format if needed
            })) : [],
            dti: 'N/A',
            spendingHabit: {
              topCategory: Object.keys(expenseSummaryForLatestMonth).length > 0 ?
                Object.entries(expenseSummaryForLatestMonth).sort(([, a], [, b]) => b - a)[0][0]
                : (Object.keys(originalExpenseSummary).length > 0 ? Object.entries(originalExpenseSummary).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'),
              style: 'N/A',
              expenseSummary: originalExpenseSummary, // Keep original if needed
              expenseSummaryForLatestMonth: expenseSummaryForLatestMonth,
              latestMonthForSummary: latestMonthForSummary,
            },
            savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' },
          },
          _rawProfile: data.profile,
          _rawIncome: data.income,
          _rawDebts: data.debts,
          _rawExpenses: data.expenses,
        };
        setUser(transformedUser);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  const value = {
    user,
    setUser,
    loading,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
