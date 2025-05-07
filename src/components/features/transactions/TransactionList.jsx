// src/components/features/transactions/TransactionList.jsx
// Displays a filterable list of transactions with actions
import React, { useState, useMemo } from 'react';
import { List, Filter, Edit2, Trash2 } from 'lucide-react'; // Added Edit2, Trash2
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';
import { Label, Select } from '../../ui/Form';
import { Button } from '../../ui/Button'; // For action buttons
import { formatCurrency } from '../../../utils/formatters';

// Added onEdit and onDelete props
export const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    if (!transactions) return ['all'];
    // Ensure all unique categories are captured, even if some transactions don't have one
    const uniqueCategories = new Set(transactions.map(tx => tx.category || 'Uncategorized'));
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (selectedCategory === 'all') {
      return transactions;
    }
    return transactions.filter(tx => (tx.category || 'Uncategorized') === selectedCategory);
  }, [transactions, selectedCategory]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const getAmountColor = (type, amount) => {
    // All transactions here are expenses, so amount will be negative
    // Color will be based on the negative amount for expenses
    if (amount < 0) return 'text-red-600 dark:text-red-400';
    if (amount > 0 && type === 'income') return 'text-green-600 dark:text-green-400'; // For future income display
    return 'text-gray-900 dark:text-white';
  };

  if (!transactions) return <p>Loading transactions...</p>; // Should be handled by parent, but good fallback

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle icon={List}>Transaction History</CardTitle>
          <CardDescription>View, filter, and manage your recorded expenses.</CardDescription>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Label htmlFor="category-filter" className="mb-0 text-xs shrink-0">Filter by Category:</Label>
          <Select
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-auto sm:w-48" // Adjusted width
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
              <TableHead className="w-[100px] sm:w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] sm:w-[150px]">Category</TableHead>
              <TableHead className="text-right w-[100px] sm:w-[120px]">Amount</TableHead>
              {/* New TableHead for Actions */}
              {(onEdit || onDelete) && <TableHead className="text-center w-[100px] sm:w-[120px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-xs text-gray-600 dark:text-gray-400">{tx.date}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white text-sm break-words">
                  {tx.description}
                </TableCell>
                <TableCell className="text-xs text-gray-600 dark:text-gray-400">{tx.category}</TableCell>
                <TableCell className={`text-right font-mono text-sm ${getAmountColor(tx.type, tx.amount)}`}>
                  {formatCurrency(tx.amount)}
                </TableCell>
                {/* New TableCell for Action Buttons */}
                {(onEdit || onDelete) && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(tx)}
                          className="p-1 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                          aria-label="Edit transaction"
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(tx.id)}
                          className="p-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={(onEdit || onDelete) ? 5 : 4} className="text-center text-gray-500 dark:text-gray-400 py-10">
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
