// src/pages/ProfilePage.jsx
// Displays the user's profile information, aggregated from various components
import React, { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { PersonalDetails } from '../components/features/profile/PersonalDetails';
import { FinancialKnowledge } from '../components/features/profile/FinancialKnowledge';
import { FinancialProfile } from '../components/features/profile/FinancialProfile';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { AddEditDebtModal } from '../components/modals/AddEditDebtModal';
import {
  updateUserProfileAPI,
  fetchComprehensiveUserDetailsAPI,
  deleteDebtDetailAPI
} from '../apiService';
import { Edit, FileText, UserCircle, AlertTriangle } from 'lucide-react'; // Added UserCircle, AlertTriangle
import { formatCurrency } from '../utils/formatters';

// Helper to transform API financial knowledge list to object (copied from UserContext for local refresh)
const transformFinancialKnowledgeForRefresh = (knowledgeList) => {
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

// Helper to transform API goals object to array (copied from UserContext for local refresh)
const transformGoalsForRefresh = (apiGoals) => {
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


export const ProfilePage = () => {
  const { user, setUser, loading, error: contextError } = useUser(); // Renamed context error
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [pageError, setPageError] = useState(null); // New state for page-level errors after initial load

  const refreshUserData = useCallback(async (userId) => {
    if (!userId) return;
    setModalError(null); // Clear previous modal-specific errors
    setPageError(null);  // Clear previous page-level refresh errors
    // No need to setLoading(true) here as ProfilePage's main loading is from useUser context
    try {
      const refreshedData = await fetchComprehensiveUserDetailsAPI(userId);

      const expenseSummaryByCategory = refreshedData.expenses && refreshedData.expenses.length > 0 ?
        refreshedData.expenses.reduce((acc, curr) => {
          const category = curr.expense_category || 'Uncategorized';
          const amount = parseFloat(String(curr.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
          acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
          return acc;
        }, {}) : {};

      let latestMonthExpenseData = {};
      let latestMonthForSummary = null;
      if (refreshedData.expenses && refreshedData.expenses.length > 0) {
        const expensesWithDates = refreshedData.expenses.map(exp => ({
          ...exp,
          date: exp.timestamp ? new Date(exp.timestamp) : null,
          amount: parseFloat(String(exp.monthly_amount || '0').replace(/[^0-9.-]+/g,"")) || 0,
        })).filter(exp => exp.date instanceof Date && !isNaN(exp.date.getTime()));

        if (expensesWithDates.length > 0) {
          expensesWithDates.sort((a, b) => b.date.getTime() - a.date.getTime());
          const latestDate = expensesWithDates[0].date;
          const latestYear = latestDate.getFullYear();
          const latestMonthNum = latestDate.getMonth();
          latestMonthForSummary = `${latestYear}-${String(latestMonthNum + 1).padStart(2, '0')}`;
          const latestMonthExpenses = expensesWithDates.filter(exp => exp.date.getFullYear() === latestYear && exp.date.getMonth() === latestMonthNum);
          latestMonthExpenseData = latestMonthExpenses.reduce((acc, curr) => {
            const category = curr.expense_category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + curr.amount;
            return acc;
          }, {});
        }
      }

      setUser(prevUser => ({
        ...prevUser,
        name: refreshedData.profile?.name || prevUser.name,
        email: refreshedData.profile?.email || prevUser.email,
        personalDetails: {
          ...prevUser.personalDetails,
          age: refreshedData.profile?.age || 'N/A', 
          netHouseholdIncome: refreshedData.income && refreshedData.income.length > 0
            ? formatCurrency(refreshedData.income.reduce((sum, item) => sum + parseFloat(String(item.monthly_income || '0').replace(/[^0-9.-]+/g,"")), 0)) + ' monthly'
            : 'N/A',
          employmentStatus: refreshedData.profile?.retirement_status || prevUser.personalDetails.employmentStatus,
          householdComposition: {
            ...prevUser.personalDetails.householdComposition,
            dependentChildren: refreshedData.profile?.num_children !== undefined ? refreshedData.profile.num_children : prevUser.personalDetails.householdComposition.dependentChildren,
          },
        },
        financialGoals: refreshedData.profile?.goals ? transformGoalsForRefresh(refreshedData.profile.goals) : [],
        financialKnowledge: transformFinancialKnowledgeForRefresh(refreshedData.financial_knowledge),
        financialProfile: {
            ...prevUser.financialProfile,
            netWorth: 'N/A',
            assets: 'N/A',
            savingsAmount: 'N/A',
            liabilities: refreshedData.debts && refreshedData.debts.length > 0
              ? formatCurrency(refreshedData.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g,"")), 0))
              : formatCurrency(0),
            totalDebt: refreshedData.debts && refreshedData.debts.length > 0
              ? formatCurrency(refreshedData.debts.reduce((sum, item) => sum + parseFloat(String(item.current_balance || '0').replace(/[^0-9.-]+/g,"")), 0))
              : formatCurrency(0),
            numberOfDebtAccounts: refreshedData.debts ? refreshedData.debts.length : 0,
            detailedDebts: refreshedData.debts ? refreshedData.debts.map(d => ({
                id: d.debt_id,
                name: d.account_name || 'N/A',
                amount: parseFloat(String(d.current_balance || '0').replace(/[^0-9.-]+/g,"")),
                interest_rate: d.interest_rate,
                min_monthly_payment: d.min_monthly_payment ? parseFloat(String(d.min_monthly_payment || '0').replace(/[^0-9.-]+/g,"")) : null,
            })) : [],
            dti: 'N/A',
            spendingHabit: {
              ...prevUser.financialProfile.spendingHabit,
              topCategory: Object.keys(latestMonthExpenseData).length > 0 ?
                Object.entries(latestMonthExpenseData).sort(([, a], [, b]) => b - a)[0][0]
                : (Object.keys(expenseSummaryByCategory).length > 0 ? Object.entries(expenseSummaryByCategory).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'),
              expenseSummary: expenseSummaryByCategory,
              expenseSummaryForLatestMonth: latestMonthExpenseData,
              latestMonthForSummary: latestMonthForSummary,
            },
        },
        _rawProfile: refreshedData.profile,
        _rawIncome: refreshedData.income || prevUser._rawIncome,
        _rawDebts: refreshedData.debts || prevUser._rawDebts,
        _rawExpenses: refreshedData.expenses || prevUser._rawExpenses,
      }));
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      setPageError(`Failed to refresh data: ${err.message}. Please try again later.`); // Use setPageError
    }
  }, [setUser]);


  const handleOpenEditProfileModal = () => {
    setModalError(null);
    setPageError(null); // Clear page error when opening modal for a new operation
    setIsEditProfileModalOpen(true);
  };
  const handleCloseEditProfileModal = () => setIsEditProfileModalOpen(false);

  const handleSaveUserProfile = async (updatedProfileData) => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setModalError("User ID not found. Cannot save profile.");
      throw new Error("User ID not found."); 
    }
    const userId = user._rawProfile.user_id;
    try {
      await updateUserProfileAPI(userId, updatedProfileData);
      await refreshUserData(userId);
      handleCloseEditProfileModal();
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Error from updateUserProfileAPI or refreshUserData will be caught
      // setModalError is good if error is from updateUserProfileAPI directly
      // If error is from refreshUserData, pageError will be set by refreshUserData
      setModalError(err.message || "An unexpected error occurred while saving profile.");
      throw err; 
    }
  };

  const handleOpenAddDebtModal = () => {
    setSelectedDebt(null);
    setModalError(null);
    setPageError(null); // Clear page error
    setIsDebtModalOpen(true);
  };

  const handleOpenEditDebtModal = (debtToEdit) => {
    setSelectedDebt(debtToEdit);
    setModalError(null);
    setPageError(null); // Clear page error
    setIsDebtModalOpen(true);
  };

  const handleCloseDebtModal = () => {
    setIsDebtModalOpen(false);
    setSelectedDebt(null);
  };

  const handleDebtSaveSuccess = async (savedDebt) => {
    console.log('Debt saved successfully:', savedDebt);
    handleCloseDebtModal();
    if (user && user._rawProfile && user._rawProfile.user_id) {
      await refreshUserData(user._rawProfile.user_id);
    }
  };

  const handleDeleteDebt = async (debtIdToDelete) => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setPageError("User ID not available. Cannot delete debt."); 
      return;
    }
    const userId = user._rawProfile.user_id;

    if (window.confirm('Are you sure you want to delete this debt account? This action cannot be undone.')) {
      try {
        await deleteDebtDetailAPI(userId, debtIdToDelete);
        console.log(`Debt ${debtIdToDelete} deleted successfully.`);
        await refreshUserData(userId);
      } catch (err) {
        console.error("Error deleting debt:", err);
        setPageError(`Failed to delete debt: ${err.message}`); 
      }
    }
  };

  // Display loading if context is loading
  if (loading) { // `loading` is from useUser()
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
        </CardContent>
      </Card>
    );
  }

  // Display error from context (initial load error)
  if (contextError) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48 p-6">
           <AlertTriangle size={48} className="text-red-500 dark:text-red-400 mb-4" />
           <p className="text-red-600 dark:text-red-400 font-semibold text-lg">Error Loading Profile</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-2 text-center">{contextError}</p>
        </CardContent>
      </Card>
    );
  }
  
  // Display page-level error (e.g., from refresh failure)
  // This will show if contextError is null but pageError is set
  if (pageError) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48 p-6">
           <AlertTriangle size={48} className="text-orange-500 dark:text-orange-400 mb-4" />
           <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">Profile Update Issue</p>
           <p className="text-orange-500 dark:text-orange-300 text-sm mt-2 text-center">{pageError}</p>
            <Button onClick={() => refreshUserData(user?._rawProfile?.user_id)} className="mt-4">
                Try to Refresh Data
            </Button>
        </CardContent>
      </Card>
    );
  }


  if (!user || !user.personalDetails || !user.financialProfile) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center">
            <UserCircle size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Profile Data Not Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">User profile data could not be loaded or is incomplete.</p>
        </CardContent>
    </Card>
    );
  }

  const { personalDetails, financialGoals, financialKnowledge, financialProfile } = user;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
        <Button variant="secondary" onClick={handleOpenEditProfileModal} icon={Edit} className="mt-4 sm:mt-0">
          Edit Profile & Goals
        </Button>
      </div>

      {modalError && ( // For errors directly from modal operations before refresh
        <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-3">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">Operation Error:</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{modalError}</p>
            </CardContent>
        </Card>
      )}

      {personalDetails && (
        <PersonalDetails
            personalDetails={personalDetails}
            financialGoals={financialGoals}
            onEditProfileAndGoals={handleOpenEditProfileModal}
        />
      )}
      
      {financialProfile && (
        <FinancialProfile
          profile={financialProfile}
          onAddDebt={handleOpenAddDebtModal}
          onEditDebt={handleOpenEditDebtModal}
          onDeleteDebt={handleDeleteDebt}
        />
      )}
      {financialKnowledge && Object.keys(financialKnowledge).length > 0 && <FinancialKnowledge knowledge={financialKnowledge} />}

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={handleCloseEditProfileModal}
        currentUserData={user._rawProfile || {}}
        onSave={handleSaveUserProfile}
      />

      <AddEditDebtModal
        isOpen={isDebtModalOpen}
        onClose={handleCloseDebtModal}
        debt={selectedDebt}
        onSaveSuccess={handleDebtSaveSuccess}
      />
    </div>
  );
};
