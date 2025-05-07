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
import { AddEditKnowledgeModal } from '../components/modals/AddEditKnowledgeModal';
import { AddEditIncomeModal } from '../components/modals/AddEditIncomeModal'; // Import Income Modal
import {
  updateUserProfileAPI,
  fetchComprehensiveUserDetailsAPI,
  deleteDebtDetailAPI,
  removeUserFinancialKnowledgeAPI,
  deleteIncomeDetailAPI, // Import income delete API
} from '../apiService';
import { Edit, FileText, UserCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Helper to transform API financial knowledge list to object for UserContext and refresh
const transformFinancialKnowledgeForRefresh = (knowledgeList) => {
  if (!knowledgeList || !Array.isArray(knowledgeList) || knowledgeList.length === 0) return {};
  return knowledgeList.reduce((acc, item) => {
    const key = item.category; 
    acc[key] = {
      level: `Level ${item.level}`, 
      description: item.description, 
      apiCategory: item.category
    };
    return acc;
  }, {});
};

// Helper to transform API goals object to array
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
  const { user, setUser, loading, error: contextError } = useUser();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false); // State for Income Modal
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState(null); // State for selected income to edit
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [pageError, setPageError] = useState(null);

  const refreshUserData = useCallback(async (userId) => {
    if (!userId) return;
    setModalError(null);
    setPageError(null);
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
      
      const knowledgeToTransform = Array.isArray(refreshedData.financial_knowledge) 
        ? refreshedData.financial_knowledge 
        : [];
      
      // Calculate total monthly income for personalDetails.netHouseholdIncome
      const totalRawMonthlyIncome = refreshedData.income?.reduce((sum, item) => sum + parseFloat(String(item.monthly_income || '0').replace(/[^0-9.-]+/g,"")), 0) || 0;

      setUser(prevUser => ({
        ...prevUser,
        name: refreshedData.profile?.name || prevUser.name,
        email: refreshedData.profile?.email || prevUser.email,
        personalDetails: {
          ...prevUser.personalDetails,
          age: refreshedData.profile?.age || 'N/A', 
          netHouseholdIncome: totalRawMonthlyIncome > 0 ? formatCurrency(totalRawMonthlyIncome) + ' monthly' : 'N/A', // Updated to use raw income
          employmentStatus: refreshedData.profile?.retirement_status || prevUser.personalDetails.employmentStatus,
          householdComposition: {
            ...prevUser.personalDetails.householdComposition,
            dependentChildren: refreshedData.profile?.num_children !== undefined ? refreshedData.profile.num_children : prevUser.personalDetails.householdComposition.dependentChildren,
          },
        },
        financialGoals: refreshedData.profile?.goals ? transformGoalsForRefresh(refreshedData.profile.goals) : [],
        financialKnowledge: transformFinancialKnowledgeForRefresh(knowledgeToTransform),
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
        _rawIncome: refreshedData.income || prevUser._rawIncome, // Ensure _rawIncome is updated
        _rawDebts: refreshedData.debts || prevUser._rawDebts,
        _rawExpenses: refreshedData.expenses || prevUser._rawExpenses,
        _rawFinancialKnowledge: knowledgeToTransform,
      }));
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      setPageError(`Failed to refresh data: ${err.message}. Please try again later.`);
    }
  }, [setUser]);


  const handleOpenEditProfileModal = () => {
    setModalError(null); setPageError(null); 
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
      setModalError(err.message || "An unexpected error occurred while saving profile.");
      throw err; 
    }
  };

  const handleOpenAddDebtModal = () => {
    setSelectedDebt(null); setModalError(null); setPageError(null); 
    setIsDebtModalOpen(true);
  };
  const handleOpenEditDebtModal = (debtToEdit) => {
    setSelectedDebt(debtToEdit); setModalError(null); setPageError(null); 
    setIsDebtModalOpen(true);
  };
  const handleCloseDebtModal = () => {
    setIsDebtModalOpen(false); setSelectedDebt(null);
  };
  const handleDebtSaveSuccess = async () => {
    handleCloseDebtModal();
    if (user?._rawProfile?.user_id) await refreshUserData(user._rawProfile.user_id);
  };
  const handleDeleteDebt = async (debtIdToDelete) => {
    if (!user?._rawProfile?.user_id) {
      setPageError("User ID not available."); return;
    }
    const userId = user._rawProfile.user_id;
    if (window.confirm('Are you sure you want to delete this debt account?')) {
      try {
        await deleteDebtDetailAPI(userId, debtIdToDelete);
        await refreshUserData(userId);
      } catch (err) { setPageError(`Failed to delete debt: ${err.message}`); }
    }
  };

  // --- Income Modal Handlers ---
  const handleOpenAddIncomeModal = () => {
    setSelectedIncome(null); setModalError(null); setPageError(null);
    setIsIncomeModalOpen(true);
  };
  const handleOpenEditIncomeModal = (incomeToEdit) => {
    setSelectedIncome(incomeToEdit); setModalError(null); setPageError(null);
    setIsIncomeModalOpen(true);
  };
  const handleCloseIncomeModal = () => {
    setIsIncomeModalOpen(false); setSelectedIncome(null);
  };
  const handleIncomeSaveSuccess = async () => {
    handleCloseIncomeModal();
    if (user?._rawProfile?.user_id) await refreshUserData(user._rawProfile.user_id);
  };
  const handleDeleteIncome = async (incomeIdToDelete) => {
    if (!user?._rawProfile?.user_id) {
      setPageError("User ID not available."); return;
    }
    const userId = user._rawProfile.user_id;
    if (window.confirm('Are you sure you want to delete this income source?')) {
      try {
        await deleteIncomeDetailAPI(userId, incomeIdToDelete);
        await refreshUserData(userId);
      } catch (err) { setPageError(`Failed to delete income: ${err.message}`); }
    }
  };
  // --- End Income Modal Handlers ---

  // --- Financial Knowledge Modal Handlers ---
  const handleOpenAddKnowledgeModal = () => {
    setSelectedKnowledge(null); setModalError(null); setPageError(null);
    setIsKnowledgeModalOpen(true);
  };

  const handleOpenEditKnowledgeModal = (knowledgeToEdit) => {
    setSelectedKnowledge(knowledgeToEdit); 
    setModalError(null); setPageError(null);
    setIsKnowledgeModalOpen(true);
  };

  const handleCloseKnowledgeModal = () => {
    setIsKnowledgeModalOpen(false); setSelectedKnowledge(null);
  };

  const handleKnowledgeSaveSuccess = async () => {
    handleCloseKnowledgeModal();
    if (user?._rawProfile?.user_id) await refreshUserData(user._rawProfile.user_id);
  };

  const handleDeleteKnowledge = async (categoryKeyToDelete) => {
    if (!user?._rawProfile?.user_id) {
      setPageError("User ID not available."); return;
    }
    const userId = user._rawProfile.user_id;
    const apiCategoryName = categoryKeyToDelete; 

    if (window.confirm(`Are you sure you want to remove knowledge for "${apiCategoryName}"?`)) {
      try {
        await removeUserFinancialKnowledgeAPI(userId, apiCategoryName);
        await refreshUserData(userId);
      } catch (err) { setPageError(`Failed to remove knowledge for "${apiCategoryName}": ${err.message}`); }
    }
  };
  // --- End Financial Knowledge Modal Handlers ---


  if (loading) {
    return <Card><CardContent className="flex justify-center items-center h-48"><p className="text-gray-600 dark:text-gray-400">Loading profile data...</p></CardContent></Card>;
  }
  if (contextError) {
    return <Card><CardContent className="flex flex-col justify-center items-center h-48 p-6"><AlertTriangle size={48} className="text-red-500 dark:text-red-400 mb-4" /><p className="text-red-600 dark:text-red-400 font-semibold text-lg">Error Loading Profile</p><p className="text-red-500 dark:text-red-300 text-sm mt-1 text-center">{contextError}</p></CardContent></Card>;
  }
  if (pageError) {
    return <Card><CardContent className="flex flex-col justify-center items-center h-48 p-6"><AlertTriangle size={48} className="text-orange-500 dark:text-orange-400 mb-4" /><p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">Profile Update Issue</p><p className="text-orange-500 dark:text-orange-300 text-sm mt-1 text-center">{pageError}</p><Button onClick={() => refreshUserData(user?._rawProfile?.user_id)} className="mt-4">Try Refresh</Button></CardContent></Card>;
  }
  if (!user || !user.personalDetails || !user.financialProfile) {
    return <Card><CardContent className="py-12 flex flex-col items-center"><UserCircle size={48} className="text-gray-400 dark:text-gray-500 mb-4" /><h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Profile Data Not Available</h3><p className="text-gray-500 dark:text-gray-400 mt-1">User data could not be loaded.</p></CardContent></Card>;
  }

  const { personalDetails, financialGoals, financialKnowledge, financialProfile, _rawIncome } = user;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
        {/* <Button variant="secondary" onClick={handleOpenEditProfileModal} icon={Edit} className="mt-4 sm:mt-0">
          Edit Profile & Goals
        </Button> */}
      </div>

      {modalError && (
        <Card className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-3"><p className="text-red-700 dark:text-red-300 text-sm font-medium">Operation Error: {modalError}</p></CardContent>
        </Card>
      )}

      {personalDetails && (
        <PersonalDetails
            personalDetails={personalDetails}
            incomeSources={_rawIncome || []} // Pass raw income data
            financialGoals={financialGoals}
            onEditProfileAndGoals={handleOpenEditProfileModal}
            onAddIncome={handleOpenAddIncomeModal}
            onEditIncome={handleOpenEditIncomeModal}
            onDeleteIncome={handleDeleteIncome}
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
      {financialKnowledge && (
        <FinancialKnowledge
            knowledge={financialKnowledge}
            onAdd={handleOpenAddKnowledgeModal}
            onEdit={handleOpenEditKnowledgeModal}
            onDelete={handleDeleteKnowledge}   
        />
      )}

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
      <AddEditIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={handleCloseIncomeModal}
        income={selectedIncome}
        onSaveSuccess={handleIncomeSaveSuccess}
      />
      <AddEditKnowledgeModal
        isOpen={isKnowledgeModalOpen}
        onClose={handleCloseKnowledgeModal}
        knowledgeItem={selectedKnowledge}
        onSaveSuccess={handleKnowledgeSaveSuccess}
      />
    </div>
  );
};
