// src/pages/ProfilePage.jsx
// Displays the user's profile information, aggregated from various components
import React, { useState } from 'react'; // Added useState
import { useUser } from '../context/UserContext';
import { PersonalDetails } from '../components/features/profile/PersonalDetails';
import { FinancialGoals } from '../components/features/profile/FinancialGoals';
import { FinancialKnowledge } from '../components/features/profile/FinancialKnowledge';
import { FinancialProfile } from '../components/features/profile/FinancialProfile';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card'; // For loading/error
import { EditProfileModal } from '../components/modals/EditProfileModal'; // Import the modal
import { updateUserProfileAPI, fetchComprehensiveUserDetailsAPI } from '../apiService'; // Import API function
import { Edit } from 'lucide-react';


export const ProfilePage = () => {
  const { user, setUser, loading, error } = useUser(); // Added setUser to update context
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);

  const handleOpenEditModal = () => {
    setModalError(null); // Clear previous modal errors
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (updatedProfileData) => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) { // Ensure user_id is available
        setModalError("User ID not found. Cannot save profile.");
        throw new Error("User ID not found.");
    }
    const userId = user._rawProfile.user_id;

    try {
      // The API expects the entire profile object for update.
      // We merge existing goals if they are not part of this specific form.
      const payload = {
        ...updatedProfileData,
        goals: user._rawProfile.goals || {}, // Preserve existing goals if not edited by this modal
      };
      
      await updateUserProfileAPI(userId, payload);
      
      // Refresh user data from context after successful save
      const refreshedUserData = await fetchComprehensiveUserDetailsAPI(userId);
      
      // Transform and set the new user data in context
      // This transformation logic should ideally be centralized if used elsewhere
      // For now, replicating parts of UserContext's transformation:
       const expenseSummaryByCategory = refreshedUserData.expenses && refreshedUserData.expenses.length > 0 ?
          refreshedUserData.expenses.reduce((acc, curr) => {
            const category = curr.expense_category || 'Uncategorized';
            const amount = parseFloat(String(curr.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
            acc[category] = (acc[category] || 0) + (isNaN(amount) ? 0 : amount);
            return acc;
          }, {}) : {};
        
        let latestMonthExpenseData = {};
        let latestMonthForSummary = null;
        if (refreshedUserData.expenses && refreshedUserData.expenses.length > 0) {
          const expensesWithDates = refreshedUserData.expenses.map(exp => ({
            ...exp,
            date: exp.timestamp ? new Date(exp.timestamp) : null,
            amount: parseFloat(String(exp.monthly_amount || '0').replace(/[^0-9.-]+/g,"")) || 0,
          })).filter(exp => exp.date instanceof Date && !isNaN(exp.date));

          if (expensesWithDates.length > 0) {
            expensesWithDates.sort((a, b) => b.date - a.date);
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
        name: refreshedUserData.profile?.name || prevUser.name,
        email: refreshedUserData.profile?.email || prevUser.email,
        personalDetails: {
          ...prevUser.personalDetails, // Keep existing ones not directly in profile API
          employmentStatus: refreshedUserData.profile?.retirement_status || prevUser.personalDetails.employmentStatus,
          householdComposition: {
            ...prevUser.personalDetails.householdComposition,
            dependentChildren: refreshedUserData.profile?.num_children !== undefined ? refreshedUserData.profile.num_children : prevUser.personalDetails.householdComposition.dependentChildren,
          },
        },
        financialProfile: {
            ...prevUser.financialProfile,
            // Update fields that come from the main profile endpoint
            // Note: detailedDebts, expenseSummaryForLatestMonth etc. are re-calculated in UserContext
            // based on _rawDebts, _rawExpenses. Here we update the direct profile attributes.
            spendingHabit: {
                ...prevUser.financialProfile.spendingHabit,
                topCategory: Object.keys(latestMonthExpenseData).length > 0 ?
                    Object.entries(latestMonthExpenseData).sort(([, a], [, b]) => b - a)[0][0]
                    : (Object.keys(expenseSummaryByCategory).length > 0 ? Object.entries(expenseSummaryByCategory).sort(([, a], [, b]) => b - a)[0][0] : 'N/A'),
                expenseSummary: expenseSummaryByCategory,
                expenseSummaryForLatestMonth: latestMonthExpenseData,
                latestMonthForSummary: latestMonthForSummary,

            }
        },
        _rawProfile: refreshedUserData.profile, // Crucially update the raw profile
         // If other raw data like income, debts, expenses are also part of comprehensive_details, update them too
        _rawIncome: refreshedUserData.income || prevUser._rawIncome,
        _rawDebts: refreshedUserData.debts || prevUser._rawDebts,
        _rawExpenses: refreshedUserData.expenses || prevUser._rawExpenses,
      }));

      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to save profile:", err);
      setModalError(err.message || "An unexpected error occurred while saving.");
      throw err; // Re-throw to be caught by modal's error handling
    }
  };


  if (loading && !user._rawProfile) { // Added !user._rawProfile to ensure initial load completes
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-32">
          <p className="text-red-600 dark:text-red-400">Error loading profile:</p>
          <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) { // This check might be redundant if loading handles it, but good as a fallback
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-gray-600 dark:text-gray-400">No user data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Destructure after ensuring user object is available and loaded
  const { personalDetails, financialGoals, financialKnowledge, financialProfile } = user;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Summary</h1>
        <Button variant="secondary" onClick={handleOpenEditModal} icon={Edit} className="mt-4 sm:mt-0">
          Edit Profile
        </Button>
      </div>

      {/* Render sections only if data is available */}
      {personalDetails && <PersonalDetails personalDetails={personalDetails} />}
      
      {/* Pass the entire profile part of user state to FinancialProfile for consistency */}
      {financialProfile && <FinancialProfile profile={financialProfile} />} 
      
      {financialKnowledge && Object.keys(financialKnowledge).length > 0 && <FinancialKnowledge knowledge={financialKnowledge} />}
      {financialGoals && financialGoals.length > 0 && <FinancialGoals goals={financialGoals} />}

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        // Pass the raw profile data for editing to match API structure
        currentUserData={user._rawProfile || {}} 
        onSave={handleSaveProfile}
      />
    </div>
  );
};
