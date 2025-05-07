// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Edit2, Trash2, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Label, Select, Textarea } from '../ui/Form'; // Added Textarea
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card'; // Added CardFooter

export const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) => {
  const [formData, setFormData] = useState({
    age: '',
    num_children: '',
    marital_status: '',
    retirement_status: '',
  });
  const [goals, setGoals] = useState([]); // [{ id: string, title: string, description: string }]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && currentUserData) {
      setFormData({
        age: currentUserData.age || '',
        num_children: currentUserData.num_children || '',
        marital_status: currentUserData.marital_status || '',
        retirement_status: currentUserData.retirement_status || '',
      });

      // Transform API goals object to array for local state
      const apiGoals = currentUserData.goals || {};
      const goalsArray = Object.entries(apiGoals).map(([key, value]) => {
        if (typeof value === 'object' && value.title && value.description) {
          return { id: key, title: value.title, description: value.description, isEditing: false };
        }
        if (typeof value === 'string') { // Handle simpler goal format if present
          return { id: key, title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), description: value, isEditing: false };
        }
        // Fallback for unexpected goal structure
        return { id: key, title: 'Unnamed Goal', description: String(value), isEditing: false };
      });
      setGoals(goalsArray);
      setError(null); // Clear previous errors
    }
  }, [currentUserData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...goals];
    updatedGoals[index][field] = value;
    setGoals(updatedGoals);
  };

  const addNewGoal = () => {
    // Add a new goal with a temporary unique ID for editing, mark as editing
    const newGoalId = `new_goal_${Date.now()}`;
    setGoals([...goals, { id: newGoalId, title: '', description: '', isEditing: true, isNew: true }]);
  };

  const toggleGoalEdit = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index].isEditing = !updatedGoals[index].isEditing;
    // If finishing editing a new unsaved goal and it's empty, remove it
    if (!updatedGoals[index].isEditing && updatedGoals[index].isNew && !updatedGoals[index].title && !updatedGoals[index].description) {
        updatedGoals.splice(index, 1);
    } else if (!updatedGoals[index].isEditing && updatedGoals[index].isNew) {
        // Mark as no longer new if it has content and user stops editing
        delete updatedGoals[index].isNew;
    }
    setGoals(updatedGoals);
  };


  const deleteGoal = (index) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Transform goals array back to API object format
    // Filter out any completely empty new goals that weren't auto-removed
    const goalsPayload = goals.reduce((acc, goal) => {
      if (goal.title || goal.description) { // Only include goals with some content
        // For new goals, generate a key. For existing, use their id.
        // The API expects an object where keys are goal identifiers and values are goal details.
        // We'll simplify to have title and description for each goal.
        const goalKey = goal.id.startsWith('new_goal_') ? goal.title.toLowerCase().replace(/\s+/g, '_') || `goal_${Object.keys(acc).length + 1}` : goal.id;
        acc[goalKey] = { title: goal.title, description: goal.description };
      }
      return acc;
    }, {});

    try {
      const payload = {
        age: formData.age ? parseInt(formData.age, 10) : null,
        num_children: formData.num_children ? parseInt(formData.num_children, 10) : null,
        marital_status: formData.marital_status || null,
        retirement_status: formData.retirement_status || null,
        goals: goalsPayload,
      };
      await onSave(payload);
      // onClose(); // onSave should handle closing on success
    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Other"];
  const retirementStatusOptions = ["Employed", "Self-Employed", "Retired", "Student", "Unemployed", "Other"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4">
          <div>
            <CardTitle icon={null} className="text-xl">Edit Profile & Goals</CardTitle>
            <CardDescription>Update your personal details and financial goals.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6 overflow-y-auto">
          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Section */}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Your age" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="num_children">Number of Children</Label>
                <Input id="num_children" name="num_children" type="number" value={formData.num_children} onChange={handleChange} placeholder="Number of children" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleChange} className="mt-1 w-full">
                  <option value="">Select Marital Status</option>
                  {maritalStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="retirement_status">Employment Status</Label>
                <Select id="retirement_status" name="retirement_status" value={formData.retirement_status} onChange={handleChange} className="mt-1 w-full">
                  <option value="">Select Employment Status</option>
                  {retirementStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                </Select>
              </div>
            </div>

            {/* Financial Goals Section */}
            <div className="pt-4">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Target size={20} className="mr-2 text-blue-600 dark:text-blue-400"/> Financial Goals
                </h3>
                <Button type="button" variant="ghost" onClick={addNewGoal} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                  <PlusCircle size={18} className="mr-1.5" /> Add Goal
                </Button>
              </div>
              {goals.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No financial goals set yet. Click "Add Goal" to create one.</p>
              )}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {goals.map((goal, index) => (
                  <div key={goal.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                    {goal.isEditing ? (
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor={`goal_title_${index}`}>Goal Title</Label>
                          <Input
                            id={`goal_title_${index}`}
                            type="text"
                            value={goal.title}
                            onChange={(e) => handleGoalChange(index, 'title', e.target.value)}
                            placeholder="e.g., Save for downpayment"
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`goal_desc_${index}`}>Description</Label>
                          <Textarea
                            id={`goal_desc_${index}`}
                            value={goal.description}
                            onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                            placeholder="e.g., Aiming for $20,000 in 2 years"
                            className="mt-1 text-sm h-20"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-1">
                           <Button type="button" variant="ghost" size="sm" onClick={() => toggleGoalEdit(index)} className="text-xs">
                             Done
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{goal.title || "(No title)"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{goal.description || "(No description)"}</p>
                        </div>
                        <div className="flex space-x-1.5 flex-shrink-0 ml-2">
                          <Button type="button" variant="ghost" size="icon" onClick={() => toggleGoalEdit(index)} className="p-1 h-auto text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                            <Edit2 size={16} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => deleteGoal(index)} className="p-1 h-auto text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
             {/* Submit Button is now in CardFooter for better layout with scrolling content */}
          </form>
        </CardContent>
        <CardFooter className="border-t dark:border-gray-700 p-6 flex justify-end space-x-3 mt-auto">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            {/* Trigger form submission by associating with the form via form="editProfileForm" or by moving this button inside the form tag */}
            {/* For simplicity, we'll assume the main save button outside the form can trigger the onSubmit of the form if it's the only form */}
            <Button onClick={handleSubmit} icon={Save} disabled={isLoading} className="min-w-[140px]">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : 'Save All Changes'}
            </Button>
        </CardFooter>
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
