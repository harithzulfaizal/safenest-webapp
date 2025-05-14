// src/pages/ProfilePage.jsx
// Displays the user's profile information, aggregated from various components
import React, { useState, useCallback, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { PersonalDetails } from '../components/features/profile/PersonalDetails';
import { FinancialKnowledge } from '../components/features/profile/FinancialKnowledge';
import { FinancialProfile } from '../components/features/profile/FinancialProfile';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { AddEditDebtModal } from '../components/modals/AddEditDebtModal';
import { AddEditKnowledgeModal } from '../components/modals/AddEditKnowledgeModal';
// AddEditIncomeModal is no longer needed as it's merged into EditProfileModal
import {
  updateUserProfileAPI,
  fetchComprehensiveUserDetailsAPI,
  createIncomeDetailAPI, // For new incomes
  updateIncomeDetailAPI, // For updating incomes
  deleteIncomeDetailAPI, // For deleting incomes
  deleteDebtDetailAPI,
  removeUserFinancialKnowledgeAPI,
} from '../apiService';
import { Edit, UserCircle, AlertTriangle, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { formatCurrency } from '../utils/formatters';

// Helper to transform API financial knowledge list to object for UserContext and refresh
const transformFinancialKnowledgeForRefresh = (knowledgeList) => {
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
const transformAndSortGoalsForRefresh = (apiGoals) => {
    if (!apiGoals || typeof apiGoals !== 'object' || Object.keys(apiGoals).length === 0) {
        return [];
    }
    // Convert to array and sort by the numeric key (priority)
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


export const ProfilePage = () => {
  const { user, setUser, loading: userLoading, error: contextError, fetchUserData: refreshUserContextData } = useUser();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  // isIncomeModalOpen is no longer needed
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  // selectedIncome is no longer needed
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  
  // Use a single state for page-level notifications (errors or success)
  const [pageNotification, setPageNotification] = useState({ type: '', message: '' }); // type: 'error' | 'success'

  // This local refresh function will now call the one from UserContext
  const refreshUserData = useCallback(async (userId) => {
    if (!userId) {
        setPageNotification({type: 'error', message: 'User ID not available for refresh.'});
        return;
    }
    setPageNotification({ type: '', message: '' }); // Clear previous notifications
    try {
      await refreshUserContextData(userId); // Call the context's fetchUserData
      // setPageNotification({type: 'success', message: 'Profile data refreshed.'}); // Optional success message
    } catch (err) {
      console.error("Failed to refresh user data from ProfilePage:", err);
      setPageNotification({ type: 'error', message: `Failed to refresh data: ${err.message}. Please try again.` });
    }
  }, [refreshUserContextData]);


  useEffect(() => {
    // If there's a context error, display it as a page notification.
    if (contextError) {
      setPageNotification({ type: 'error', message: `Error loading profile: ${contextError}` });
    }
  }, [contextError]);


  const handleOpenEditProfileModal = () => {
    setPageNotification({ type: '', message: '' }); // Clear notifications when opening modal
    setIsEditProfileModalOpen(true);
  };
  const handleCloseEditProfileModal = () => setIsEditProfileModalOpen(false);

  const handleSaveUserProfileAndIncome = async ({ profileData, incomeChanges }) => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      throw new Error("User ID not found. Cannot save profile.");
    }
    const userId = user._rawProfile.user_id;
    let overallSuccess = true;
    let errorMessages = [];

    // 1. Update User Profile (Personal Details & Goals)
    try {
      await updateUserProfileAPI(userId, profileData);
    } catch (err) {
      overallSuccess = false;
      errorMessages.push(`Failed to update profile details: ${err.message}`);
      console.error("Error updating profile:", err);
    }

    // 2. Process Income Changes
    // Delete incomes
    if (incomeChanges.deletedIncomeIds && incomeChanges.deletedIncomeIds.length > 0) {
      for (const incomeId of incomeChanges.deletedIncomeIds) {
        try {
          await deleteIncomeDetailAPI(userId, incomeId);
        } catch (err) {
          overallSuccess = false;
          errorMessages.push(`Failed to delete income ID ${incomeId}: ${err.message}`);
          console.error(`Error deleting income ${incomeId}:`, err);
        }
      }
    }
    // Update existing incomes
    if (incomeChanges.updatedIncomes && incomeChanges.updatedIncomes.length > 0) {
      for (const income of incomeChanges.updatedIncomes) {
        try {
          await updateIncomeDetailAPI(userId, income.income_id, income);
        } catch (err) {
          overallSuccess = false;
          errorMessages.push(`Failed to update income "${income.income_source || income.income_id}": ${err.message}`);
          console.error(`Error updating income ${income.income_id}:`, err);
        }
      }
    }
    // Add new incomes
    if (incomeChanges.newIncomes && incomeChanges.newIncomes.length > 0) {
      for (const income of incomeChanges.newIncomes) {
        try {
          await createIncomeDetailAPI(userId, income);
        } catch (err) {
          overallSuccess = false;
          errorMessages.push(`Failed to add income "${income.income_source}": ${err.message}`);
          console.error("Error creating new income:", err);
        }
      }
    }

    // After all operations, refresh user data to reflect all changes
    await refreshUserData(userId);

    if (overallSuccess) {
      handleCloseEditProfileModal(); // Close modal on full success
      // Set success notification on the page if desired, or rely on modal's internal success message
      // setPageNotification({ type: 'success', message: 'Profile and income updated successfully!' });
    } else {
      // If any part failed, keep modal open and throw an error to be caught by modal's error handling
      const combinedError = errorMessages.join('; ');
      throw new Error(combinedError || "An unexpected error occurred while saving some changes.");
    }
  };


  // --- Debt Modal Handlers ---
  const handleOpenAddDebtModal = () => {
    setSelectedDebt(null); setPageNotification({ type: '', message: '' });
    setIsDebtModalOpen(true);
  };
  const handleOpenEditDebtModal = (debtToEdit) => {
    setSelectedDebt(debtToEdit); setPageNotification({ type: '', message: '' });
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
      setPageNotification({ type: 'error', message: "User ID not available." }); return;
    }
    const userId = user._rawProfile.user_id;
    if (window.confirm('Are you sure you want to delete this debt account?')) {
      try {
        await deleteDebtDetailAPI(userId, debtIdToDelete);
        await refreshUserData(userId);
         setPageNotification({ type: 'success', message: 'Debt account deleted successfully.' });
      } catch (err) { setPageNotification({ type: 'error', message: `Failed to delete debt: ${err.message}` }); }
    }
  };

  // --- Financial Knowledge Modal Handlers ---
  const handleOpenAddKnowledgeModal = () => {
    setSelectedKnowledge(null); setPageNotification({ type: '', message: '' });
    setIsKnowledgeModalOpen(true);
  };
  const handleOpenEditKnowledgeModal = (knowledgeToEdit) => {
    setSelectedKnowledge(knowledgeToEdit); setPageNotification({ type: '', message: '' });
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
      setPageNotification({ type: 'error', message: "User ID not available." }); return;
    }
    const userId = user._rawProfile.user_id;
    // The categoryKeyToDelete is the actual API category name from financialKnowledge object structure
    const apiCategoryName = categoryKeyToDelete;

    if (window.confirm(`Are you sure you want to remove knowledge for "${apiCategoryName}"?`)) {
      try {
        await removeUserFinancialKnowledgeAPI(userId, apiCategoryName);
        await refreshUserData(userId);
        setPageNotification({ type: 'success', message: `Financial knowledge for "${apiCategoryName}" removed.` });
      } catch (err) { setPageNotification({ type: 'error', message: `Failed to remove knowledge for "${apiCategoryName}": ${err.message}` }); }
    }
  };

  // --- Render Logic ---
  if (userLoading) {
    return <Card><CardContent className="flex justify-center items-center h-48"><p className="text-gray-600 dark:text-gray-400">Loading profile data...</p></CardContent></Card>;
  }

  // Display general page notifications (errors/success)
  const renderPageNotification = () => {
    if (!pageNotification.message) return null;
    const isError = pageNotification.type === 'error';
    return (
      <Card className={`mb-4 ${isError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'}`}>
        <CardContent className="p-3 flex items-center">
          {isError ? <AlertTriangle className="h-5 w-5 text-red-500 mr-2" /> : <UserCircle className="h-5 w-5 text-green-500 mr-2" />} {/* Using UserCircle for success, replace if better icon available */}
          <p className={`text-sm font-medium ${isError ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
            {pageNotification.message}
          </p>
        </CardContent>
      </Card>
    );
  };
  
  if (!user || !user.personalDetails || !user.financialProfile) {
     // This case might be hit if contextError is not set but user data is still incomplete
    return (
        <Card>
            <CardContent className="py-12 flex flex-col items-center">
                <UserCircle size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Profile Data Not Available</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">User data could not be loaded or is incomplete.</p>
                {user?._rawProfile?.user_id && (
                    <Button onClick={() => refreshUserData(user._rawProfile.user_id)} icon={RefreshCw} className="mt-4">
                        Try Refresh
                    </Button>
                )}
            </CardContent>
        </Card>
    );
  }

  const { personalDetails, financialGoals, financialKnowledge, financialProfile, _rawProfile, _rawIncome } = user;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Dashboard</h1>
        {/* Main edit button now opens the consolidated modal */}
        {/* <Button variant="default" onClick={handleOpenEditProfileModal} icon={Edit} className="mt-4 sm:mt-0">
          Edit Profile & Data
        </Button> */}
      </div>

      {renderPageNotification()}

      {personalDetails && (
        <PersonalDetails
          personalDetails={personalDetails}
          incomeSources={_rawIncome || []} // Pass raw income data for display
          financialGoals={financialGoals || []} // Pass sorted goals for display
          onEditProfileAndGoals={handleOpenEditProfileModal} // This button opens the main modal
          // No more individual income handlers here
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
          knowledge={financialKnowledge || {}}
          onAdd={handleOpenAddKnowledgeModal}
          onEdit={handleOpenEditKnowledgeModal}
          onDelete={handleDeleteKnowledge}   
        />
      )}

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={handleCloseEditProfileModal}
        currentUserData={_rawProfile || {}} // Pass raw profile for personal details and goals object
        currentIncomeSources={_rawIncome || []} // Pass raw income for editing
        onSave={handleSaveUserProfileAndIncome} // New consolidated save handler
      />
      <AddEditDebtModal
        isOpen={isDebtModalOpen}
        onClose={handleCloseDebtModal}
        debt={selectedDebt}
        onSaveSuccess={handleDebtSaveSuccess}
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