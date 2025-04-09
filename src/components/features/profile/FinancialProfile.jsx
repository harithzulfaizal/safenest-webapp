import React from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { DetailItem } from '../DetailItem';

export const FinancialProfile = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={Wallet}>Financial Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Net Worth" value={profile.netWorth} />
          <DetailItem label="Assets" value={profile.assets} />
          <DetailItem label="Savings Amount" value={profile.savingsAmount} />
          <DetailItem label="Liabilities" value={profile.liabilities} />
          <DetailItem label="Total Debt" value={profile.totalDebt} />
          <DetailItem label="Debt-to-Income" value={profile.dti} />
        </div>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Top Spending Category" value={profile.spendingHabit.topCategory} />
          <DetailItem label="Spending Style" value={profile.spendingHabit.style} />
          <DetailItem label="Savings Rate" value={profile.savingsHabit.savingsRate} />
          <DetailItem label="Emergency Fund Status" value={profile.savingsHabit.emergencyFundStatus} />
        </div>
      </CardContent>
    </Card>
  );
};