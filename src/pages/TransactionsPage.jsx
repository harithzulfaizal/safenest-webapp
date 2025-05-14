// src/pages/TransactionsPage.jsx
// Fetches and displays user transactions with CRUD operations
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { TransactionList } from '../components/features/transactions/TransactionList';
import { AddEditExpenseModal } from '../components/modals/AddEditExpenseModal';
import { API_BASE_URL } from '../apiConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'; // Added CardHeader, CardTitle
import { Button } from '../components/ui/Button';
import { PlusCircle, Edit2, Trash2, FileText, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'; // Added TrendingUp, TrendingDown, DollarSign
import { useUser } from '../context/UserContext';
import { fetchUserExpensesAPI, deleteExpenseDetailAPI } from '../apiService';
import { formatCurrency } from '../utils/formatters';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: userLoading, error: userError, setUser } = useUser();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchTransactions = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching transactions for user:", userId);
      const data = await fetchUserExpensesAPI(userId);

      const transformedTransactions = data.map(tx => {
        const rawAmount = parseFloat(String(tx.monthly_amount || '0').replace(/[^0-9.-]+/g,""));
        const type = String(tx.transaction_type || 'OUT').toUpperCase();
        return {
          id: tx.expense_id,
          date: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A',
          description: tx.description || 'N/A',
          category: tx.expense_category || 'Uncategorized',
          amount: rawAmount,
          transaction_type: type,
        };
      }).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const isValidA = !isNaN(dateA.getTime());
        const isValidB = !isNaN(dateB.getTime());
        if (isValidA && isValidB) return dateB.getTime() - dateA.getTime();
        if (isValidA) return -1;
        if (isValidB) return 1;
        return 0;
      });
      setTransactions(transformedTransactions);

      setUser(prevUser => {
        if (JSON.stringify(prevUser._rawExpenses) !== JSON.stringify(data)) {
          return {
            ...prevUser,
            _rawExpenses: data.map(exp => ({ ...exp, transaction_type: exp.transaction_type || 'OUT' })),
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
  }, [setUser]);

  useEffect(() => {
    if (user && user._rawProfile && user._rawProfile.user_id && !userLoading) {
      fetchTransactions(user._rawProfile.user_id);
    } else if (!userLoading && (!user || !user._rawProfile || !user._rawProfile.user_id)) {
      setError("User ID not available. Cannot fetch transactions.");
      setLoading(false);
      setTransactions([]);
    }
    if (userError && !userLoading) {
      setError(`User data error: ${userError}. Cannot determine user for transactions.`);
      setLoading(false);
      setTransactions([]);
    }
  }, [user, userLoading, userError, fetchTransactions]);

  // Calculate total income and expenses
  const { totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(tx => {
      if (tx.transaction_type === 'IN') {
        income += tx.amount;
      } else if (tx.transaction_type === 'OUT') {
        expenses += tx.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses };
  }, [transactions]);


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
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
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

  if (userLoading || (loading && transactions.length === 0 && !error) ) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-60">
          <div role="status" className="flex flex-col items-center">
            <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="text-gray-600 dark:text-gray-400 mt-2">
              {userLoading ? "Loading user data..." : "Loading transactions..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-60 p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 dark:text-red-400 mb-3" />
          <p className="text-red-600 dark:text-red-400 font-semibold text-lg">Error Fetching Transactions</p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
          {user && user._rawProfile && user._rawProfile.user_id && (
             <Button onClick={() => fetchTransactions(user._rawProfile.user_id)} icon={RefreshCw} className="mt-4">
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

      {/* Summary Card Section */}
      {!loading && transactions.length > 0 && ( // Only show summary if not loading and transactions exist
        <Card>
          <CardHeader>
            <CardTitle icon={DollarSign} className="text-xl">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Income Card */}
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-800 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Money In</p>
                <p className="text-2xl font-semibold text-green-800 dark:text-green-200">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            {/* Total Expenses Card */}
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-800 mr-4">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Money Out</p>
                <p className="text-2xl font-semibold text-red-800 dark:text-red-200">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {transactions.length === 0 && !loading && (
         <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
                <FileText size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Expenses Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Click "Add New Expense" to record your first one.</p>
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
