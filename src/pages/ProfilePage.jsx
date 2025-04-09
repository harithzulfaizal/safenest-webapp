import React from 'react';
import { useUser } from '../context/UserContext';
import { PersonalDetails } from '../components/features/profile/PersonalDetails';
import { FinancialGoals } from '../components/features/profile/FinancialGoals';
import { FinancialKnowledge } from '../components/features/profile/FinancialKnowledge';
import { FinancialProfile } from '../components/features/profile/FinancialProfile';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { user } = useUser();
  const { personalDetails, financialGoals, financialKnowledge, financialProfile } = user;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Summary</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalDetails personalDetails={personalDetails} />
        <FinancialGoals goals={financialGoals} />
        <FinancialKnowledge knowledge={financialKnowledge} />
        <FinancialProfile profile={financialProfile} />
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button variant="secondary">Edit Profile Details</Button>
      </div>
    </div>
  );
};