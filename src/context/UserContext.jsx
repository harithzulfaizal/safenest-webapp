// src/context/UserContext.jsx
// Provides user data to components, fetched from the backend API
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { formatCurrency } from '../utils/formatters';
// Note: Ensure API_BASE_URL is correctly imported if used in new functions
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
  const [loading, setLoading] = useState(false); // Tracks loading of user data - Initialized to false
  const [error, setError] = useState(null); // For page-specific errors
  const [globalPersistentError, setGlobalPersistentError] = useState(null); // For errors that should persist across pages
  
  // Insights-specific state
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false); // Initial load for insights
  const [insightsRegenerating, setInsightsRegenerating] = useState(false); // For regeneration process
  const [insightsError, setInsightsError] = useState(null); // For insights-related errors

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
          savings: data.profile?.savings || 'N/A',
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
        _rawExpenses: (data.expenses || []).map(exp => ({
          ...exp,
          // Ensure transaction_type exists, defaulting to 'OUT' if not provided by API
          transaction_type: exp.transaction_type || 'OUT', 
        })),
        _rawFinancialKnowledge: knowledgeToTransform,
      }));
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Set loading false at the end of fetch
    }
  }, []); // Empty dependency array: fetchUserData is stable and doesn't depend on component state/props

  // --- Insights Logic (adapted from InsightsPage.jsx) ---

  const fetchLatestInsights = useCallback(async (userId, isFallbackAfterRegenError = false) => {
    const isCurrentlyRegenerating = insightsRegenerating; // Capture current value

    if (!isFallbackAfterRegenError && !isCurrentlyRegenerating) {
      setInsightsLoading(true);
    }

    if (!isFallbackAfterRegenError) {
      if (!(insightsError && insightsError.startsWith("Insights regeneration failed"))) {
        setInsightsError(null);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/insights/latest`);
      if (!response.ok) {
        const errorText = await response.text();
        if ((response.status === 404 || response.status === 500) && !isFallbackAfterRegenError) {
          console.warn(`Received status ${response.status} from /insights/latest. User may not have insights yet. Response: ${errorText}`);
          setInsights([]);
          // Do not set insightsError here if it's just a 404, let the UI handle "no insights"
          if (response.status === 500) {
             setInsightsError(`Failed to fetch latest insights: Server error (${response.status}).`);
          }
          return;
        }
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Failed to fetch latest insights: ${response.status} - ${errorData.detail || 'Unknown API error'}`);
        } catch (jsonError) {
          const shortErrorText = errorText.length > 100 ? errorText.substring(0, 100) + "..." : errorText;
          throw new Error(`Failed to fetch latest insights: ${response.status}. Server returned non-JSON response: ${shortErrorText}`);
        }
      }

      const data = await response.json();
      const rawInsightsData = data.insights;
      const transformedInsights = [];

      if (rawInsightsData && typeof rawInsightsData === 'object' && !Array.isArray(rawInsightsData)) {
        if (rawInsightsData.debt_insights) {
          transformedInsights.push({
            id: data.insight_id ? `debt_${data.insight_id}` : `debt_${Date.now()}`,
            title: rawInsightsData.debt_insights.financial_goal || "Debt Management Insight",
            explanation: rawInsightsData.debt_insights.detailed_insight,
            impact: rawInsightsData.debt_insights.implications,
            nextSteps: rawInsightsData.debt_insights.recommended_actions
              ? rawInsightsData.debt_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0)
              : [],
          });
        }
        if (rawInsightsData.savings_insights) {
          transformedInsights.push({
            id: data.insight_id ? `savings_${data.insight_id}` : `savings_${Date.now() + 1}`,
            title: rawInsightsData.savings_insights.financial_goal || "Savings Strategy Insight",
            explanation: rawInsightsData.savings_insights.detailed_insight,
            impact: rawInsightsData.savings_insights.implications,
            nextSteps: rawInsightsData.savings_insights.recommended_actions
              ? rawInsightsData.savings_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0)
              : [],
          });
        }
      } else if (Array.isArray(rawInsightsData)) {
         transformedInsights.push(...rawInsightsData.map((insight, index) => ({
            id: insight.id || `${data.insight_id}_${index}` || `custom_insight_${Date.now() + index}`,
            title: insight.title || "Financial Insight",
            explanation: insight.explanation || "No detailed explanation provided.",
            impact: insight.impact || "Impact not specified.",
            nextSteps: Array.isArray(insight.nextSteps) ? insight.nextSteps : (typeof insight.nextSteps === 'string' ? insight.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [])
        })));
      }
      setInsights(transformedInsights);
      setInsightsError(null); // Clear any previous insight errors on successful fetch
    } catch (err) {
      console.error("Error fetching latest insights (UserContext):", err);
      if (!isFallbackAfterRegenError) {
        if (!(insightsError && insightsError.startsWith("Insights regeneration failed"))) {
          setInsightsError(err.message);
        } else {
          console.warn("Fetch error occurred while a regeneration error was active (not overwriting modal):", err.message);
        }
      } else {
         setInsightsError(prevError => `${prevError || 'Regeneration failed.'} Additionally, failed to fetch previous insights: ${err.message}`);
      }
      setInsights([]);
    } finally {
      if (!isFallbackAfterRegenError && !isCurrentlyRegenerating) {
        setInsightsLoading(false);
      }
    }
  }, [insightsRegenerating, insightsError]); // Added insightsError

  const handleRegenerateInsights = useCallback(async (userId) => {
    if (!userId) {
      setInsightsError("User ID not available. Cannot regenerate insights.");
      return;
    }
    setInsightsRegenerating(true);
    setInsightsError(null);
    let regenerationFailed = false;
    let regenErrorMessage = "Insights regeneration failed. Please try again. Showing previously available insights.";

    try {
      const regenerateResponse = await fetch(`${API_BASE_URL}/users/${userId}/insights/financial_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!regenerateResponse.ok) {
        regenerationFailed = true;
        const errorText = await regenerateResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          regenErrorMessage = `Insights regeneration failed (${regenerateResponse.status}): ${errorData.detail || 'Unknown API error'}. Please try again. Showing previously available insights.`;
        } catch (jsonError) {
          const shortErrorText = errorText.length > 100 ? errorText.substring(0, 100) + "..." : errorText;
          regenErrorMessage = `Insights regeneration failed (${regenerateResponse.status}): Server returned non-JSON response (${shortErrorText}). Please try again. Showing previously available insights.`;
        }
      } else {
         console.log("Insights regenerated successfully via POST, now fetching latest from DB (UserContext)...");
      }
    } catch (err) {
      regenerationFailed = true;
      console.error("Error during insight regeneration POST request (UserContext):", err);
      regenErrorMessage = `Insights regeneration failed: ${err.message}. Please try again. Showing previously available insights.`;
    } finally {
      if (regenerationFailed) {
        setInsightsError(regenErrorMessage);
      }
      // Always attempt to fetch latest insights, whether regeneration succeeded or failed
      // Pass the userId directly to fetchLatestInsights
      await fetchLatestInsights(userId, regenerationFailed);
      setInsightsRegenerating(false);
    }
  }, [fetchLatestInsights]); // fetchLatestInsights is a dependency

  // --- End of Insights Logic ---

  // Effect for fetching user data based on auth state
  useEffect(() => {
    if (isLoadingAuth) {
      return; // Wait for auth to be resolved
    }

    const currentAuthUserId = authenticatedUser?.userId;

    if (isLoggedIn && currentAuthUserId) {
      // Fetch user data only if:
      // 1. We don't have _rawProfile yet OR
      // 2. The _rawProfile is for a different user OR
      // 3. We are not currently loading user data.
      // This check prevents re-fetching if data for the current user is already loaded or being loaded.
      if ((!user._rawProfile || user._rawProfile.user_id !== currentAuthUserId) && !loading) {
        fetchUserData(currentAuthUserId, authenticatedUser.email);
      }
    } else if (!isLoggedIn) {
      // Reset user state if not logged in
      setUser({
        name: 'User', email: 'user@example.com', memberSince: 'N/A', accountType: 'N/A',
        personalDetails: { age: 'N/A', gender: 'N/A', netHouseholdIncome: 'N/A', employmentStatus: 'N/A', householdComposition: { dependentAdults: 0, dependentChildren: 0 }, emergencyFundSavingsLevel: 'N/A' },
        financialGoals: [], financialKnowledge: {},
        financialProfile: { netWorth: 'N/A', assets: 'N/A', savingsAmount: 'N/A', liabilities: 'N/A', totalDebt: 'N/A', numberOfDebtAccounts: 0, detailedDebts: [], dti: 'N/A', spendingHabit: { topCategory: 'N/A', style: 'N/A', expenseSummary: {}, expenseSummaryForLatestMonth: {}, latestMonthForSummary: null, }, savingsHabit: { savingsRate: 'N/A', emergencyFundStatus: 'N/A' }, },
        _rawProfile: null, _rawIncome: [], _rawDebts: [], _rawExpenses: [], _rawFinancialKnowledge: [],
      });
      setLoading(false); // Ensure loading is false for user data
      setError(null);    // Clear general user error

      // Also reset insights state when user logs out
      setInsights([]);
      setInsightsLoading(false);
      setInsightsRegenerating(false);
      setInsightsError(null);
    }
  }, [isLoggedIn, authenticatedUser?.userId, isLoadingAuth, fetchUserData, user._rawProfile?.user_id, loading]);


  // Effect for fetching insights data once user_id is available from user._rawProfile
  useEffect(() => {
    const userIdFromProfile = user._rawProfile?.user_id;

    if (userIdFromProfile) {
      // Only fetch if insights are not already present, not loading, not regenerating, and no error
      if (insights.length === 0 && !insightsLoading && !insightsRegenerating && !insightsError) {
        fetchLatestInsights(userIdFromProfile);
      }
    }
    // This effect should run when userIdFromProfile becomes available or if fetchLatestInsights changes.
    // The other state variables (insights.length etc.) are conditions checked inside,
    // but also included as dependencies to re-evaluate if an external action (e.g. closing error modal)
    // changes one of them, potentially making a fetch necessary again.
  }, [user._rawProfile?.user_id, fetchLatestInsights, insights.length, insightsLoading, insightsRegenerating, insightsError]);

  const value = {
    user,
    setUser,
    loading, // Consumers of the context might still need this loading state
    error, // Page-specific error for general user data
    fetchUserData,
    globalPersistentError, // Global error (consider if insightsError should also use this)
    setGlobalPersistentError, // Setter for global error

    // Insights-related values
    insights,
    insightsLoading,
    insightsRegenerating,
    insightsError,
    fetchLatestInsights,     // Expose the function to fetch insights
    handleRegenerateInsights, // Expose the function to regenerate insights
    setInsightsError, // Allow clearing insights error from components (e.g., modal close)
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
