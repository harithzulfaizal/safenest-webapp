// src/context/UserContext.jsx
// Provides user data to components, fetched from the backend API
import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_USER_ID } from '../apiConfig';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from './AuthContext';

const UserContext = createContext();

// Helper to transform API financial knowledge list to object
const transformFinancialKnowledge = (knowledgeList) => {
  if (!knowledgeList || !Array.isArray(knowledgeList) || knowledgeList.length === 0) return {}; // Ensure it's an array
  return knowledgeList.reduce((acc, item) => {
    // Using item.category directly as the key, as API returns it this way.
    // This key will be used by FinancialKnowledge component.
    const key = item.category; 
    acc[key] = { // Changed from a more complex key generation
      level: `Level ${item.level}`, // API returns level as integer
      description: item.description, // API returns description
      apiCategory: item.category, // Store original category name for API calls if needed
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
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { id: key, title: title, description: value };
    }
    return { id: key, title: "Goal Detail", description: String(value) };
  });
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    memberSince: '2023-01-15',
    accountType: 'Premium',
    personalDetails: {
      age: 'N/A', 
      netHouseholdIncome: 'N/A', // This will be calculated from _rawIncome
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
      detailedDebts: [],
      dti: 'N/A',
      spendingHabit: {
        topCategory: 'N/A',
        style: 'N/A',
        expenseSummary: {},
        expenseSummaryForLatestMonth: {},
        latestMonthForSummary: null,
      },
      savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' },
    },
    _rawProfile: null, 
    _rawIncome: [], // Will store the raw income objects from API
    _rawDebts: [],
    _rawExpenses: [],
    _rawFinancialKnowledge: [], // Store raw knowledge for consistency
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

        // Calculate total monthly income from the raw income data
        const totalRawMonthlyIncome = data.income?.reduce((sum, item) => {
            const incomeVal = parseFloat(String(item.monthly_income || '0').replace(/[^0-9.-]+/g,""));
            return sum + (isNaN(incomeVal) ? 0 : incomeVal);
        }, 0) || 0;

        let expenseSummaryForLatestMonth = {};
        let latestMonthForSummary = null;
        if (data.expenses && data.expenses.length > 0) {
          const expensesWithDates = data.expenses.map(exp => {
            const amount = parseFloat(String(exp.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
            return {
              ...exp,
              date: exp.timestamp ? new Date(exp.timestamp) : null,
              amount: isNaN(amount) ? 0 : amount,
            };
          }).filter(exp => exp.date instanceof Date && !isNaN(exp.date.getTime()));

          if (expensesWithDates.length > 0) {
            expensesWithDates.sort((a, b) => b.date.getTime() - a.date.getTime());
            const latestDate = expensesWithDates[0].date;
            const latestYear = latestDate.getFullYear();
            const latestMonthNum = latestDate.getMonth();
            latestMonthForSummary = `${latestYear}-${String(latestMonthNum + 1).padStart(2, '0')}`;
            const latestMonthExpenses = expensesWithDates.filter(exp =>
              exp.date.getFullYear() === latestYear && exp.date.getMonth() === latestMonthNum
            );
            expenseSummaryForLatestMonth = latestMonthExpenses.reduce((acc, curr) => {
              const category = curr.expense_category || 'Uncategorized';
              acc[category] = (acc[category] || 0) + curr.amount;
              return acc;
            }, {});
          }
        }

        const originalExpenseSummary = data.expenses && data.expenses.length > 0 ?
          data.expenses.reduce((acc, curr) => {
            const category = curr.expense_category || 'Uncategorized';
            const amount = parseFloat(String(curr.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
            acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
            return acc;
          }, {}) : {};
        
        // Ensure financial_knowledge is an array before transforming
        const knowledgeToTransform = Array.isArray(data.financial_knowledge) 
            ? data.financial_knowledge 
            : [];

        setUser({
          name: data.profile?.name || user.name,
          email: data.profile?.email || user.email,
          memberSince: user.memberSince, 
          accountType: user.accountType, 
          personalDetails: {
            age: data.profile?.age || 'N/A', 
              netHouseholdIncome: totalRawMonthlyIncome > 0 ? formatCurrency(totalRawMonthlyIncome) + ' monthly' : 'N/A',
            employmentStatus: data.profile?.retirement_status || "N/A",
            householdComposition: {
              dependentAdults: 0, 
              dependentChildren: data.profile?.num_children || 0,
            },
            emergencyFundSavingsLevel: 'N/A', 
          },
          financialGoals: data.profile?.goals ? transformGoals(data.profile.goals) : [],
          financialKnowledge: transformFinancialKnowledge(knowledgeToTransform),
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
            detailedDebts: data.debts ? data.debts.map(d => ({
              id: d.debt_id,
              name: d.account_name || 'N/A',
              amount: parseFloat(String(d.current_balance || '0').replace(/[^0-9.-]+/g,"")),
              interest_rate: d.interest_rate, 
              min_monthly_payment: d.min_monthly_payment ? parseFloat(String(d.min_monthly_payment || '0').replace(/[^0-9.-]+/g,"")) : null,
            })) : [],
            dti: 'N/A', 
            spendingHabit: {
              topCategory: Object.keys(expenseSummaryForLatestMonth).length > 0 ?
                Object.entries(expenseSummaryForLatestMonth).sort(([, a], [, b]) => b - a)[0][0]
                : (Object.keys(originalExpenseSummary).length > 0 ? Object.entries(originalExpenseSummary).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'),
              style: 'N/A', 
              expenseSummary: originalExpenseSummary,
              expenseSummaryForLatestMonth: expenseSummaryForLatestMonth,
              latestMonthForSummary: latestMonthForSummary,
            },
            savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' }, 
          },
          _rawProfile: data.profile,
          _rawIncome: data.income || [], // Store raw income from API
          _rawDebts: data.debts || [],
          _rawExpenses: data.expenses || [],
          _rawFinancialKnowledge: knowledgeToTransform, // Store raw knowledge from API
        });
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
