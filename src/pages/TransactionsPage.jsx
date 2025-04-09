import React from 'react';
import { mockTransactions } from '../data/mockData';
import { TransactionList } from '../components/features/transactions/TransactionList';

export const TransactionsPage = () => {
  return <TransactionList transactions={mockTransactions} />;
};