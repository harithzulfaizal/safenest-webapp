// src/components/modals/AddEditDebtModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Landmark, Percent, DollarSign, FileText } from 'lucide-react'; // Added FileText for Account Name
import { Button } from '../ui/Button';
import { Input, Label } from '../ui/Form'; // Assuming Select is not needed here unless for debt types
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { createDebtDetailAPI, updateDebtDetailAPI } from '../../apiService';
import { useUser } from '../../context/UserContext';

export const AddEditDebtModal = ({ isOpen, onClose, debt, onSaveSuccess }) => {
  const { user } = useUser();
  const initialFormData = {
    account_name: '',
    current_balance: '', // API expects number or string convertible to number
    interest_rate: '',   // Store as percentage string for input, convert to decimal for API
    min_monthly_payment: '', // API expects number or string convertible to number
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // `debt.id` from FinancialProfile maps to `debt_id` in the API
  const isEditMode = Boolean(debt && debt.id);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && debt) {
        setFormData({
          account_name: debt.name || '',
          // debt.amount is already a number from FinancialProfile transformation
          current_balance: debt.amount ? String(debt.amount) : '',
          // debt.interest_rate is decimal from API (e.g., 0.18), convert to percentage string for input
          interest_rate: debt.interest_rate ? String(parseFloat(debt.interest_rate)) : '',
          // min_monthly_payment might not be directly on `debt` object from FinancialProfile,
          // it would be part of the raw debt data if available. Assuming it's not for now or needs fetching.
          // For now, if it's not there, it will be an empty string.
          // If your API provides min_monthly_payment in the GET /debts/{debt_id} response, ensure it's loaded.
          min_monthly_payment: debt.min_monthly_payment ? String(debt.min_monthly_payment) : '',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null); // Clear errors when modal opens
    }
  }, [isOpen, debt, isEditMode]);

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
      setError("User ID not found. Cannot save debt.");
      setIsLoading(false);
      return;
    }
    const userId = user._rawProfile.user_id;

    const payload = {
      ...formData,
      current_balance: parseFloat(formData.current_balance) || 0,
      // Convert interest rate from percentage string (e.g., "18.5") to decimal (e.g., 0.185) for API
      interest_rate: formData.interest_rate ? (parseFloat(formData.interest_rate)) : null,
      min_monthly_payment: parseFloat(formData.min_monthly_payment) || null, // API might allow null
    };

    // Remove fields that are empty strings and should be null if API expects that
    if (payload.account_name === '') payload.account_name = null;


    try {
      let savedDebt;
      if (isEditMode) {
        savedDebt = await updateDebtDetailAPI(userId, debt.id, payload); // debt.id is debt_id
      } else {
        savedDebt = await createDebtDetailAPI(userId, payload);
      }
      onSaveSuccess(savedDebt);
    } catch (err) {
      console.error("Failed to save debt:", err);
      setError(err.message || "Failed to save debt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <CardTitle icon={Landmark} className="text-xl">
              {isEditMode ? 'Edit Debt Account' : 'Add New Debt Account'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details of your debt.' : 'Enter the details for the new debt account.'}
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
              <Label htmlFor="account_name" className="flex items-center mb-1.5">
                <FileText size={14} className="mr-2 text-gray-500" /> Account Name
              </Label>
              <Input
                id="account_name"
                name="account_name"
                type="text"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="e.g., Visa Credit Card, Student Loan"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="current_balance" className="flex items-center mb-1.5">
                <DollarSign size={14} className="mr-2 text-gray-500" /> Current Balance
              </Label>
              <Input
                id="current_balance"
                name="current_balance"
                type="number"
                step="0.01"
                value={formData.current_balance}
                onChange={handleChange}
                placeholder="e.g., 2500.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="interest_rate" className="flex items-center mb-1.5">
                <Percent size={14} className="mr-2 text-gray-500" /> Interest Rate (%)
              </Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={handleChange}
                placeholder="e.g., 18.5 for 18.5%"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="min_monthly_payment" className="flex items-center mb-1.5">
                <DollarSign size={14} className="mr-2 text-gray-500" /> Minimum Monthly Payment (Optional)
              </Label>
              <Input
                id="min_monthly_payment"
                name="min_monthly_payment"
                type="number"
                step="0.01"
                value={formData.min_monthly_payment}
                onChange={handleChange}
                placeholder="e.g., 50.00"
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
                ) : (isEditMode ? 'Save Changes' : 'Add Debt')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Keyframes for modal animation (can be moved to global CSS if used by multiple modals) */}
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
