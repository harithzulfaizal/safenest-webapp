// src/components/features/profile/PersonalDetails.jsx
// Displays user's personal details
import React from 'react';
import { DollarSign, Briefcase, Users, ShieldCheck, User as UserIconLucide } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';

export const PersonalDetails = ({ personalDetails }) => {
  if (!personalDetails) return <p>Loading personal details...</p>; // Basic loading/null check

  return (
    <Card>
      <CardHeader>
        <CardTitle icon={UserIconLucide}>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailItem
          label="Net Household Income"
          value={personalDetails.netHouseholdIncome}
          icon={DollarSign}
        />
        <DetailItem
          label="Employment Status"
          value={personalDetails.employmentStatus}
          icon={Briefcase}
        />
        <DetailItem
          label="Household Composition"
          value={`${personalDetails.householdComposition?.dependentAdults || 0} Adult(s), ${personalDetails.householdComposition?.dependentChildren || 0} Child(ren)`}
          icon={Users}
        />
        <DetailItem
          label="Emergency Fund Savings Level"
          value={personalDetails.emergencyFundSavingsLevel}
          icon={ShieldCheck}
        />
      </CardContent>
    </Card>
  );
};
