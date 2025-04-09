import React, { useState, useMemo } from 'react';
import { List, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';
import { Label } from '../../ui/Form';
import { Select } from '../../ui/Form';
import { formatCurrency } from '../../../utils/formatters';

export const TransactionList = ({ transactions }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories from transactions for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map(tx => tx.category));
    return ['all', ...Array.from(uniqueCategories)]; // Add 'all' option
  }, [transactions]);

  // Filter transactions based on selected category
  const filteredTransactions = useMemo(() => {
    if (selectedCategory === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.category === selectedCategory);
  }, [transactions, selectedCategory]);

  // Handle category selection change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Helper function to determine amount color
  const getAmountColor = (type, amount) => {
    if (type === 'income') return 'text-green-600 dark:text-green-400';
    if (amount < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-900 dark:text-white';
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle icon={List}>Transactions</CardTitle>
          <CardDescription>View and filter your recent expenses, debts, and investments.</CardDescription>
        </div>
        
        {/* Filter Dropdown */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Label htmlFor="category-filter" className="mb-0 text-xs">Filter by Category:</Label>
          <Select
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-40"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-gray-600 dark:text-gray-400">{tx.date}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white">{tx.description}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">{tx.category}</TableCell>
                <TableCell className={`text-right font-mono ${getAmountColor(tx.type, tx.amount)}`}>
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
            
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan="4" className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No transactions found {selectedCategory !== 'all' ? `for category "${selectedCategory}"` : ''}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};