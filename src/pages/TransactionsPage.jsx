// src/pages/TransactionsPage.jsx
// Fetches and displays user transactions with CRUD operations
import React, { useState, useEffect, useCallback } from 'react';
import { TransactionList } from '../components/features/transactions/TransactionList';
import { AddEditExpenseModal } from '../components/modals/AddEditExpenseModal'; // Import the modal
import { API_BASE_URL, DEFAULT_USER_ID } from '../apiConfig';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button'; // For Add button
import { PlusCircle, Edit2, Trash2, FileText } from 'lucide-react'; // Added FileText and other icons
import { useUser } from '../context/UserContext';
import { fetchUserExpensesAPI, deleteExpenseDetailAPI } from '../apiService'; // API functions
import { formatCurrency } from '../utils/formatters'; // For consistent display

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: userLoading, error: userError, setUser } = useUser();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null); // For editing

  // Memoized fetch function
  const fetchTransactions = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching transactions for user:", userId);
      const data = await fetchUserExpensesAPI(userId);
      const transformedTransactions = data.map(tx => ({
        id: tx.expense_id,
        date: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A',
        description: tx.description || 'N/A',
        category: tx.expense_category || 'Uncategorized',
        amount: -Math.abs(parseFloat(String(tx.monthly_amount || '0').replace(/[^0-9.-]+/g,""))),
        type: 'expense',
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(transformedTransactions);

      // Update UserContext with the fresh expenses
      // Only call setUser if the raw data has actually changed to prevent potential minor loops
      // This check might be overly cautious if `data` is always a new reference.
      // The main fix is removing `user` from useCallback's dependencies.
      setUser(prevUser => {
        // Basic check to see if _rawExpenses needs updating.
        // For a more robust check, you might deep compare or use a version/timestamp.
        if (JSON.stringify(prevUser._rawExpenses) !== JSON.stringify(data)) {
          return {
            ...prevUser,
            _rawExpenses: data,
          };
        }
        return prevUser;
      });

    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  // FIX: Removed `user` from the dependency array. `setUser` has a stable reference.
  }, [setUser]);

  useEffect(() => {
    if (user && user._rawProfile && user._rawProfile.user_id && !userLoading) {
      fetchTransactions(user._rawProfile.user_id);
    } else if (!userLoading && (!user || !user._rawProfile || !user._rawProfile.user_id)) {
      setError("User ID not available. Cannot fetch transactions.");
      setLoading(false);
      setTransactions([]);
    }
  }, [user, userLoading, userError, fetchTransactions]); // `user` is needed here to re-fetch if the user_id changes.


  const handleOpenAddExpenseModal = () => {
    setSelectedExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpenseModal = (expense) => {
    setSelectedExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  const handleExpenseSaveSuccess = async (savedExpense) => {
    console.log('Expense saved successfully:', savedExpense);
    handleCloseExpenseModal();
    if (user && user._rawProfile && user._rawProfile.user_id) {
      await fetchTransactions(user._rawProfile.user_id);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setError("User ID not available. Cannot delete expense.");
      return;
    }
    const userId = user._rawProfile.user_id;

    if (window.confirm('Are you sure you want to delete this expense?')) {
      setLoading(true);
      try {
        await deleteExpenseDetailAPI(userId, expenseId);
        console.log(`Expense ${expenseId} deleted successfully.`);
        await fetchTransactions(userId);
      } catch (err) {
        console.error("Error deleting expense:", err);
        setError(`Failed to delete expense: ${err.message}. Please refresh and try again.`);
        setLoading(false);
      }
    }
  };

  if (userLoading && loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-gray-600 dark:text-gray-400">Loading user data and transactions...</p>
        </CardContent>
      </Card>
    );
  }
   if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-48 p-6">
          <p className="text-red-600 dark:text-red-400 font-semibold text-lg">Error Fetching Transactions</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-2 text-center">{error}</p>
          {user && user._rawProfile && user._rawProfile.user_id && (
             <Button onClick={() => fetchTransactions(user._rawProfile.user_id)} className="mt-4">
                Try Again
             </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          My Expenses
        </h1>
        <Button onClick={handleOpenAddExpenseModal} icon={PlusCircle}>
          Add New Expense
        </Button>
      </div>

      {transactions.length === 0 && !loading && (
         <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
                <FileText size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Expenses Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Click "Add New Expense" to get started.</p>
            </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <TransactionList
            transactions={transactions}
            onEdit={handleOpenEditExpenseModal}
            onDelete={handleDeleteExpense}
        />
      )}

      {isExpenseModalOpen && (
        <AddEditExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={handleCloseExpenseModal}
          expense={selectedExpense}
          onSaveSuccess={handleExpenseSaveSuccess}
        />
      )}
    </div>
  );
};
