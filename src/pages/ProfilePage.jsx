// src/pages/ProfilePage.jsx
// Displays the user's profile information, aggregated from various components
import React from 'react';
import { useUser } from '../context/UserContext';
import { PersonalDetails } from '../components/features/profile/PersonalDetails';
import { FinancialGoals } from '../components/features/profile/FinancialGoals';
import { FinancialKnowledge } from '../components/features/profile/FinancialKnowledge';
import { FinancialProfile } from '../components/features/profile/FinancialProfile';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card'; // For loading/error

export const ProfilePage = () => {
  const { user, loading, error } = useUser();

  if (loading) {
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

  if (!user) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-gray-600 dark:text-gray-400">No user data available.</p>
        </CardContent>
      </Card>
    );
  }

  const { personalDetails, financialGoals, financialKnowledge, financialProfile } = user;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Summary</h1>
        <Button variant="secondary" className="mt-4 sm:mt-0">Edit Profile Details</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {personalDetails && <PersonalDetails personalDetails={personalDetails} />}
        {financialProfile && <FinancialProfile profile={financialProfile} />}
        {financialKnowledge && <FinancialKnowledge knowledge={financialKnowledge} />}
        {financialGoals && <FinancialGoals goals={financialGoals} />}
      </div>
    </div>
  );
};
