// src/context/UserContext.jsx
// Provides user data to components, fetched from the backend API
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { fetchComprehensiveUserDetailsAPI } from '../apiService';

const UserContext = createContext();

// Helper to transform API financial knowledge list to object
const transformFinancialKnowledge = (knowledgeList) => {
  if (!knowledgeList || !Array.isArray(knowledgeList) || knowledgeList.length === 0) return {};
  return knowledgeList.reduce((acc, item) => {
    const key = item.category;
    acc[key] = {
      level: `Level ${item.level}`,
      description: item.description,
      apiCategory: item.category,
    };
    return acc;
  }, {});
};

// Helper to transform API goals object (potentially ordered) to a sorted array for display
const transformAndSortGoals = (apiGoals) => {
  if (!apiGoals || typeof apiGoals !== 'object' || Object.keys(apiGoals).length === 0) {
    return [];
  }
  return Object.entries(apiGoals)
    .sort(([keyA], [keyB]) => parseInt(keyA, 10) - parseInt(keyB, 10))
    .map(([key, value]) => {
      const baseGoal = { id: key, original_id: key, title: '', description: '' };
      if (typeof value === 'object' && value.title && value.description) {
        return { ...baseGoal, title: value.title, description: value.description };
      }
      if (typeof value === 'string') {
        const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { ...baseGoal, title: title, description: value };
      }
      return { ...baseGoal, title: `Goal ${key}`, description: String(value) };
    });
};


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    memberSince: 'N/A',
    accountType: 'N/A',
    personalDetails: {
      age: 'N/A',
      gender: 'N/A',
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
    _rawIncome: [],
    _rawDebts: [],
    _rawExpenses: [],
    _rawFinancialKnowledge: [],
  });
  const [loading, setLoading] = useState(true); // Tracks loading of user data
  const [error, setError] = useState(null);
  const { isLoggedIn, authenticatedUser, isLoadingAuth } = useAuth(); // Added isLoadingAuth

  const fetchUserData = useCallback(async (userIdToFetch, userEmailFromAuth) => {
    if (!userIdToFetch) {
      setError("User ID not available for fetching data.");
      setLoading(false);
      return;
    }
    setLoading(true); // Set loading true at the start of fetch
    setError(null);
    try {
      const data = await fetchComprehensiveUserDetailsAPI(userIdToFetch);

      const totalRawMonthlyIncome = data.income?.reduce((sum, item) => {
        const incomeVal = parseFloat(String(item.monthly_income || '0').replace(/[^0-9.-]+/g, ""));
        return sum + (isNaN(incomeVal) ? 0 : incomeVal);
      }, 0) || 0;

      let expenseSummaryForLatestMonth = {};
      let latestMonthForSummary = null;
      if (data.expenses && data.expenses.length > 0) {
        const expensesWithDates = data.expenses.map(exp => {
          const amount = parseFloat(String(exp.monthly_amount || '0').replace(/[^0-9.-]+/g, ""));
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
          const amount = parseFloat(String(curr.monthly_amount || '0').replace(/[^0-9.-]+/g, ""));
          acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
          return acc;
        }, {}) : {};

      const knowledgeToTransform = Array.isArray(data.financial_knowledge)
        ? data.financial_knowledge
        : [];

      setUser(prevUser => ({
        ...prevUser,
        email: userEmailFromAuth || data.profile?.email || 'user@example.com',
        name: data.profile?.name || 'User',
        personalDetails: {
          ...prevUser.personalDetails,
          age: data.profile?.age || 'N/A',
          gender: data.profile?.gender || 'N/A',
          netHouseholdIncome: totalRawMonthlyIncome > 0 ? formatCurrency(totalRawMonthlyIncome) + ' monthly' : 'N/A',
          employmentStatus: data.profile?.retirement_status || "N/A",
          householdComposition: {
            dependentAdults: data.profile?.dependent_adults || 0,
            dependentChildren: data.profile?.num_children || 0,
          },
        },
        financialGoals: data.profile?.goals ? transformAndSortGoals(data.profile.goals) : [],
        financialKnowledge: transformFinancialKnowledge(knowledgeToTransform),
        financialProfile: {
          ...prevUser.financialProfile,
          netWorth: 'N/A',
          assets: 'N/A',
          savingsAmount: 'N/A',
          liabilities: data.debts && data.debts.length > 0
            ? formatCurrency(data.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g, "")), 0))
            : formatCurrency(0),
          totalDebt: data.debts && data.debts.length > 0
            ? formatCurrency(data.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g, "")), 0))
            : formatCurrency(0),
          numberOfDebtAccounts: data.debts ? data.debts.length : 0,
          detailedDebts: data.debts ? data.debts.map(d => ({
            id: d.debt_id,
            name: d.account_name || 'N/A',
            amount: parseFloat(String(d.current_balance || '0').replace(/[^0-9.-]+/g, "")),
            interest_rate: d.interest_rate,
            min_monthly_payment: d.min_monthly_payment ? parseFloat(String(d.min_monthly_payment || '0').replace(/[^0-9.-]+/g, "")) : null,
          })) : [],
          spendingHabit: {
            ...prevUser.financialProfile.spendingHabit,
            topCategory: Object.keys(expenseSummaryForLatestMonth).length > 0 ?
              Object.entries(expenseSummaryForLatestMonth).sort(([, a], [, b]) => b - a)[0][0]
              : (Object.keys(originalExpenseSummary).length > 0 ? Object.entries(originalExpenseSummary).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'),
            expenseSummary: originalExpenseSummary,
            expenseSummaryForLatestMonth: expenseSummaryForLatestMonth,
            latestMonthForSummary: latestMonthForSummary,
          },
        },
        _rawProfile: data.profile,
        _rawIncome: data.income || [],
        _rawDebts: data.debts || [],
        _rawExpenses: data.expenses || [],
        _rawFinancialKnowledge: knowledgeToTransform,
      }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Set loading false at the end of fetch
    }
  }, []); // Empty dependency array: fetchUserData is stable and doesn't depend on component state/props

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoadingAuth) {
      return; 
    }

    if (isLoggedIn && authenticatedUser && authenticatedUser.userId) {
      fetchUserData(authenticatedUser.userId, authenticatedUser.email);
    } else if (!isLoggedIn) {
      // Reset user state and set loading to false if not logged in
      setUser({
        name: 'User', email: 'user@example.com', memberSince: 'N/A', accountType: 'N/A',
        personalDetails: { age: 'N/A', gender: 'N/A', netHouseholdIncome: 'N/A', employmentStatus: 'N/A', householdComposition: { dependentAdults: 0, dependentChildren: 0 }, emergencyFundSavingsLevel: 'N/A' },
        financialGoals: [], financialKnowledge: {},
        financialProfile: { netWorth: 'N/A', assets: 'N/A', savingsAmount: 'N/A', liabilities: 'N/A', totalDebt: 'N/A', numberOfDebtAccounts: 0, detailedDebts: [], dti: 'N/A', spendingHabit: { topCategory: 'N/A', style: 'N/A', expenseSummary: {}, expenseSummaryForLatestMonth: {}, latestMonthForSummary: null, }, savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' }, },
        _rawProfile: null, _rawIncome: [], _rawDebts: [], _rawExpenses: [], _rawFinancialKnowledge: [],
      });
      setLoading(false); // Explicitly set loading to false as no data fetch will occur
      setError(null);
    }
  }, [isLoggedIn, authenticatedUser, fetchUserData, isLoadingAuth]); // Removed 'loading' from here

  const value = {
    user,
    setUser,
    loading, // Consumers of the context might still need this loading state
    error,
    fetchUserData,
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
