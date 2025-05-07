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
      dti: 'N/A',
      spendingHabit: { topCategory: 'N/A', style: 'N/A' },
      savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      // Optionally reset user data or keep stale data
      // setUser(initialState); // if you want to clear data on logout
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

        const transformedUser = {
          ...user, // Keep mock name, email etc. or update if API provides them
          personalDetails: {
            netHouseholdIncome: data.income && data.income.length > 0
              ? formatCurrency(data.income.reduce((sum, item) => sum + parseFloat(item.monthly_income || 0), 0)) + ' monthly'
              : 'N/A',
            employmentStatus: data.profile?.retirement_status === "Employed" ? "Full-time" : data.profile?.retirement_status || "N/A",
            householdComposition: {
              dependentAdults: 0, // API only gives num_children. This is a placeholder.
              dependentChildren: data.profile?.num_children || 0,
            },
            emergencyFundSavingsLevel: 'N/A', // Not directly available from this API endpoint
          },
          financialGoals: data.profile?.goals ? transformGoals(data.profile.goals) : [],
          financialKnowledge: transformFinancialKnowledge(data.financial_knowledge),
          financialProfile: {
            netWorth: 'N/A', // Placeholder
            assets: 'N/A', // Placeholder
            savingsAmount: 'N/A', // Placeholder
            liabilities: 'N/A', // Placeholder
            totalDebt: data.debts && data.debts.length > 0
              ? formatCurrency(data.debts.reduce((sum, item) => sum + parseFloat(item.current_balance || 0), 0))
              : formatCurrency(0),
            dti: 'N/A', // Placeholder
            spendingHabit: {
              topCategory: data.expenses && data.expenses.length > 0 ?
                Object.entries(data.expenses.reduce((acc, curr) => {
                  acc[curr.expense_category] = (acc[curr.expense_category] || 0) + parseFloat(curr.monthly_amount || 0);
                  return acc;
                }, {})).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                : 'N/A',
              style: 'N/A' // Placeholder
            },
            savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' }, // Placeholders
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
  }, [isLoggedIn]); // Effect dependencies

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
