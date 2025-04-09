import React from 'react';
import { DollarSign, Briefcase, Users, ShieldCheck, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';

export const PersonalDetails = ({ personalDetails }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={User}>Personal Details</CardTitle>
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
          value={`${personalDetails.householdComposition.dependentAdults} Adult(s), ${personalDetails.householdComposition.dependentChildren} Child(ren)`} 
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