// src/components/modals/AddEditExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, CalendarDays, Tag, Type } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Label, Select } from '../ui/Form';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { API_BASE_URL, DEFAULT_USER_ID } from '../../apiConfig'; // For user_id
import { createExpenseDetailAPI, updateExpenseDetailAPI } from '../../apiService';
import { useUser } from '../../context/UserContext'; // To get user_id

// A more comprehensive list of expense categories
const expenseCategories = [
  "Housing", "Transportation", "Food", "Utilities", "Healthcare",
  "Personal Care", "Entertainment", "Education", "Childcare", "Debt Payments",
  "Savings/Investments", "Gifts/Donations", "Travel", "Shopping", "Groceries",
  "Dining Out", "Subscriptions", "Insurance", "Taxes", "Other"
].sort();


export const AddEditExpenseModal = ({ isOpen, onClose, expense, onSaveSuccess }) => {
  const { user } = useUser(); // Get user context
  const initialFormData = {
    expense_category: '',
    monthly_amount: '', // API expects number or string convertible to number
    description: '',
    timestamp: new Date().toISOString().split('T')[0], // Default to today, YYYY-MM-DD
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(expense && expense.id); // `id` here is the frontend id, API uses `expense_id`

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && expense) {
        setFormData({
          expense_category: expense.category || '',
          // API returns monthly_amount as a string, sometimes with currency. Ensure it's a plain number for the input.
          // The API expects a number or string that can be parsed to a number for amount.
          // We take absolute because expenses are stored as negative in TransactionList, but API might expect positive.
          // Based on API schema, monthly_amount is string or null. Let's assume API handles conversion from string.
          monthly_amount: expense.amount ? String(Math.abs(expense.amount)) : '',
          description: expense.description || '',
          // Assuming expense.date is in 'MM/DD/YYYY' format from TransactionList, convert to 'YYYY-MM-DD'
          timestamp: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null); // Clear errors when modal opens
    }
  }, [isOpen, expense, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setError("User ID not found. Cannot save expense.");
      setIsLoading(false);
      return;
    }
    const userId = user._rawProfile.user_id;

    // Prepare payload for the API
    // API expects monthly_amount as number or string convertible to number.
    // Timestamp should be ISO 8601 if it includes time, or YYYY-MM-DD.
    // For simplicity, we send YYYY-MM-DD and let the backend handle it.
    // If the backend expects a full datetime, adjust accordingly.
    const payload = {
      ...formData,
      monthly_amount: parseFloat(formData.monthly_amount) || 0, // Ensure it's a number
      // If your backend expects a full ISO string for timestamp:
      // timestamp: formData.timestamp ? new Date(formData.timestamp).toISOString() : new Date().toISOString(),
    };

    try {
      let savedExpense;
      if (isEditMode) {
        // `expense.id` is the frontend transaction ID, which maps to `expense_id` in the backend
        savedExpense = await updateExpenseDetailAPI(userId, expense.id, payload);
      } else {
        savedExpense = await createExpenseDetailAPI(userId, payload);
      }
      onSaveSuccess(savedExpense); // Pass saved/updated expense data back
      // onClose(); // onSaveSuccess should handle closing or refreshing
    } catch (err) {
      console.error("Failed to save expense:", err);
      setError(err.message || "Failed to save expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <CardTitle icon={null} className="text-xl">
              {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details of your expense.' : 'Enter the details for the new expense.'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">Error:</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="expense_category" className="flex items-center mb-1.5">
                <Tag size={14} className="mr-2 text-gray-500" /> Category
              </Label>
              <Select
                id="expense_category"
                name="expense_category"
                value={formData.expense_category}
                onChange={handleChange}
                required
                className="mt-1 w-full"
              >
                <option value="">Select Category</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="monthly_amount" className="flex items-center mb-1.5">
                <DollarSign size={14} className="mr-2 text-gray-500" /> Amount
              </Label>
              <Input
                id="monthly_amount"
                name="monthly_amount"
                type="number"
                step="0.01" // Allow decimals
                value={formData.monthly_amount}
                onChange={handleChange}
                placeholder="e.g., 50.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="flex items-center mb-1.5">
                <Type size={14} className="mr-2 text-gray-500" /> Description
              </Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Weekly groceries"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="timestamp" className="flex items-center mb-1.5">
                <CalendarDays size={14} className="mr-2 text-gray-500" /> Date
              </Label>
              <Input
                id="timestamp"
                name="timestamp"
                type="date" // HTML5 date picker
                value={formData.timestamp}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-700">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (isEditMode ? 'Save Changes' : 'Add Expense')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modalFadeIn {
          animation: modalFadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
