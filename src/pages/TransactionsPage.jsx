// src/pages/TransactionsPage.jsx
// Fetches and displays user transactions
import React, { useState, useEffect } from 'react';
import { TransactionList } from '../components/features/transactions/TransactionList';
import { API_BASE_URL, DEFAULT_USER_ID } from '../apiConfig';
import { Card, CardContent } from '../components/ui/Card';
import { useUser } from '../context/UserContext'; // To potentially use cached expenses

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: userLoading, error: userError } = useUser();


  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check if expenses are already in UserContext to avoid redundant API call
        if (user && user._rawExpenses && !userLoading && !userError) {
            console.log("Using transactions from UserContext");
            const transformed = user._rawExpenses.map(tx => ({
                id: tx.expense_id,
                date: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A',
                description: tx.description,
                category: tx.expense_category,
                amount: -Math.abs(parseFloat(tx.monthly_amount || 0)),
                type: 'expense',
            }));
            setTransactions(transformed);
            setLoading(false);
            return;
        }
        
        // Fallback to direct API call if not in context or context is loading/error
        console.log("Fetching transactions directly from API for TransactionsPage");
        const response = await fetch(`${API_BASE_URL}/users/${DEFAULT_USER_ID}/expenses`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}`}));
          throw new Error(`Failed to fetch transactions: ${response.status} - ${errorData.detail}`);
        }
        const data = await response.json();

        const transformedTransactions = data.map(tx => ({
          id: tx.expense_id,
          date: tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A',
          description: tx.description,
          category: tx.expense_category,
          amount: -Math.abs(parseFloat(tx.monthly_amount || 0)),
          type: 'expense',
        }));
        setTransactions(transformedTransactions);

      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if user context is not loading or has an error, to give it a chance to load first
    if(!userLoading){
        fetchTransactions();
    } else {
        // If user context is still loading, this page will also show its own loading state until context resolves or direct fetch completes
        console.log("UserContext loading, TransactionsPage will wait or fetch independently.")
    }

  }, [user, userLoading, userError]); // Re-fetch if user context data changes

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center h-32">
          <p className="text-red-600 dark:text-red-400">Error fetching transactions:</p>
          <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return <TransactionList transactions={transactions} />;
};
