// src/components/modals/AddEditIncomeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Briefcase, Type } from 'lucide-react'; // Using Briefcase for source, Type for description
import { Button } from '../ui/Button';
import { Input, Label, Textarea } from '../ui/Form'; // Added Textarea
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { createIncomeDetailAPI, updateIncomeDetailAPI } from '../../apiService';
import { useUser } from '../../context/UserContext';

export const AddEditIncomeModal = ({ isOpen, onClose, income, onSaveSuccess }) => {
  const { user } = useUser();
  const initialFormData = {
    income_source: '',
    monthly_income: '', // API expects number or string convertible to number
    description: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(income && income.income_id);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && income) {
        setFormData({
          income_source: income.income_source || '',
          monthly_income: income.monthly_income ? String(income.monthly_income) : '',
          description: income.description || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null); // Clear errors when modal opens
    }
  }, [isOpen, income, isEditMode]);

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
      setError("User ID not found. Cannot save income.");
      setIsLoading(false);
      return;
    }
    const userId = user._rawProfile.user_id;

    const payload = {
      ...formData,
      monthly_income: parseFloat(formData.monthly_income) || 0,
    };
    
    // API might expect null for empty optional fields
    if (payload.description === '') payload.description = null;


    try {
      let savedIncome;
      if (isEditMode) {
        savedIncome = await updateIncomeDetailAPI(userId, income.income_id, payload);
      } else {
        savedIncome = await createIncomeDetailAPI(userId, payload);
      }
      onSaveSuccess(savedIncome);
    } catch (err) {
      console.error("Failed to save income:", err);
      setError(err.message || "Failed to save income. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <CardTitle icon={DollarSign} className="text-xl">
              {isEditMode ? 'Edit Income Source' : 'Add New Income Source'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details of your income source.' : 'Enter the details for the new income source.'}
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
              <Label htmlFor="income_source" className="flex items-center mb-1.5">
                <Briefcase size={14} className="mr-2 text-gray-500" /> Income Source Name
              </Label>
              <Input
                id="income_source"
                name="income_source"
                type="text"
                value={formData.income_source}
                onChange={handleChange}
                placeholder="e.g., Salary, Freelance Project"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="monthly_income" className="flex items-center mb-1.5">
                <DollarSign size={14} className="mr-2 text-gray-500" /> Monthly Amount
              </Label>
              <Input
                id="monthly_income"
                name="monthly_income"
                type="number"
                step="0.01"
                value={formData.monthly_income}
                onChange={handleChange}
                placeholder="e.g., 5000.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="flex items-center mb-1.5">
                <Type size={14} className="mr-2 text-gray-500" /> Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Primary job at Tech Corp, Side hustle income"
                className="mt-1 h-24"
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
                ) : (isEditMode ? 'Save Changes' : 'Add Income')}
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
