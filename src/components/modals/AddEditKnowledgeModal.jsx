// src/components/modals/AddEditKnowledgeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Label, Select } from '../ui/Form';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { useUser } from '../../context/UserContext';
import { addOrUpdateUserFinancialKnowledgeAPI, fetchFinancialKnowledgeDefinitionsAPI } from '../../apiService';

const defaultKnowledgeCategories = [ // Fallback if API definitions fail
    "Budgeting", "Investing", "Credit & Debt", "Retirement Planning", "Insurance", "Taxation", "Estate Planning"
].sort();

const knowledgeLevels = [
    { value: 1, label: "Level 1 (Beginner)" },
    { value: 2, label: "Level 2 (Novice)" },
    { value: 3, label: "Level 3 (Intermediate)" },
    { value: 4, label: "Level 4 (Advanced)" },
    { value: 5, label: "Level 5 (Expert)" },
];

export const AddEditKnowledgeModal = ({ isOpen, onClose, knowledgeItem, onSaveSuccess }) => {
  const { user } = useUser();
  const initialFormData = {
    category: '',
    level: '', // Will store the numeric level
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState(defaultKnowledgeCategories);
  const [definitionsLoading, setDefinitionsLoading] = useState(false);

  const isEditMode = Boolean(knowledgeItem && knowledgeItem.category);

  useEffect(() => {
    const loadDefinitions = async () => {
        setDefinitionsLoading(true);
        try {
            const definitions = await fetchFinancialKnowledgeDefinitionsAPI();
            // Extract unique categories from definitions
            const uniqueCategories = [...new Set(definitions.map(def => def.category))].sort();
            if (uniqueCategories.length > 0) {
                setAvailableCategories(uniqueCategories);
            } else {
                setAvailableCategories(defaultKnowledgeCategories);
            }
        } catch (err) {
            console.error("Failed to load knowledge definitions:", err);
            setAvailableCategories(defaultKnowledgeCategories); // Use fallback
        } finally {
            setDefinitionsLoading(false);
        }
    };

    if (isOpen) {
        loadDefinitions();
        if (isEditMode && knowledgeItem) {
            // knowledgeItem.level is like "Level X", extract X
            const levelMatch = knowledgeItem.level?.match(/\d+/);
            const numericLevel = levelMatch ? parseInt(levelMatch[0], 10) : '';
            setFormData({
                category: knowledgeItem.category || '',
                level: numericLevel,
            });
        } else {
            setFormData(initialFormData);
        }
        setError(null);
    }
  }, [isOpen, knowledgeItem, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'level' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setError("User ID not found. Cannot save knowledge.");
      setIsLoading(false);
      return;
    }
    if (!formData.category || !formData.level) {
        setError("Category and Level are required.");
        setIsLoading(false);
        return;
    }
    const userId = user._rawProfile.user_id;

    const payload = {
      category: formData.category,
      level: formData.level, // API expects integer level
    };

    try {
      // The POST endpoint for financial_knowledge handles both create and update.
      const savedKnowledge = await addOrUpdateUserFinancialKnowledgeAPI(userId, payload);
      onSaveSuccess(savedKnowledge); // Pass saved/updated data back
    } catch (err) {
      console.error("Failed to save financial knowledge:", err);
      setError(err.message || "Failed to save knowledge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <CardTitle icon={BookOpen} className="text-xl">
              {isEditMode ? 'Edit Financial Knowledge' : 'Add Financial Knowledge'}
            </CardTitle>
            <CardDescription>
              {isEditMode ? 'Update your proficiency level.' : 'Add a new area of financial knowledge.'}
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
              <Label htmlFor="category" className="flex items-center mb-1.5">Category</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={isEditMode || definitionsLoading} // Disable category change in edit mode for simplicity
                className="mt-1 w-full"
              >
                <option value="">{definitionsLoading ? "Loading categories..." : "Select Category"}</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              {isEditMode && <p className="text-xs text-gray-500 mt-1">Category cannot be changed in edit mode. To change category, delete and re-add.</p>}
            </div>

            <div>
              <Label htmlFor="level" className="flex items-center mb-1.5">Proficiency Level</Label>
              <Select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="mt-1 w-full"
              >
                <option value="">Select Level</option>
                {knowledgeLevels.map(lvl => (
                  <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t dark:border-gray-700">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={isLoading || definitionsLoading} className="min-w-[120px]">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (isEditMode ? 'Update Level' : 'Add Knowledge')}
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
