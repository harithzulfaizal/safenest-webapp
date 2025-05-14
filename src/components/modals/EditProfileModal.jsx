// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, PlusCircle, Edit2, Trash2, Target, Briefcase, DollarSign, Type, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Label, Select, Textarea } from '../ui/Form';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
// No direct API calls from here; onSave will handle them in ProfilePage

const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Other", "Prefer not to say"];
const retirementStatusOptions = ["Employed", "Self-Employed", "Retired", "Student", "Unemployed", "Other", "Prefer not to say"];
const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];

export const EditProfileModal = ({ isOpen, onClose, currentUserData, currentIncomeSources, onSave }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    age: '',
    num_children: '',
    marital_status: '',
    retirement_status: '',
    gender: '', // Added gender
  });

  const [goals, setGoals] = useState([]);
  // Goal: { id: string (temp or original), original_id: string | null, title: string, description: string, isEditing: boolean, isNew: boolean }

  const [incomeSources, setIncomeSources] = useState([]);
  // Income: { tempId: string, income_id: number | null, income_source: string, monthly_income: string, description: string, isEditing: boolean, isNew: boolean, toBeDeleted: boolean }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // For goal drag-and-drop
  const draggedGoalIndex = useRef(null);
  const draggedOverGoalIndex = useRef(null);

  // For inline income editing (form for the income item being edited/added)
  const [editingIncomeTempId, setEditingIncomeTempId] = useState(null); // tempId of income being edited
  const [currentIncomeForm, setCurrentIncomeForm] = useState({ income_source: '', monthly_income: '', description: '' });


  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      // Personal Details
      setFormData({
        age: currentUserData?.age || '',
        num_children: currentUserData?.num_children !== undefined ? String(currentUserData.num_children) : '',
        marital_status: currentUserData?.marital_status || '',
        retirement_status: currentUserData?.retirement_status || '', // This is employment status
        gender: currentUserData?.gender || '',
      });

      // Goals: API goals are { "1": {title, desc}, "2": ... }
      // We need to transform to sorted array: [{id:"1", title, desc}, {id:"2", title, desc}]
      const apiGoals = currentUserData?.goals || {};
      const goalsArray = Object.entries(apiGoals)
        .sort(([keyA], [keyB]) => parseInt(keyA, 10) - parseInt(keyB, 10)) // Sort by numeric key
        .map(([key, value]) => ({
          id: key, // Use the numeric key as ID for existing, for now
          original_id: key, // Store the original API key
          title: value.title || '',
          description: value.description || '',
          isEditing: false,
          isNew: false,
        }));
      setGoals(goalsArray);

      // Income Sources: currentIncomeSources is user._rawIncome
      // Map to local state, adding tempId for local list key management
      const initialIncomeSources = (currentIncomeSources || []).map((inc, index) => ({
        tempId: `existing_inc_${inc.income_id || index}`, // Stable temp ID
        income_id: inc.income_id,
        income_source: inc.income_source || '',
        monthly_income: inc.monthly_income ? String(inc.monthly_income) : '',
        description: inc.description || '',
        isEditing: false,
        isNew: false,
        toBeDeleted: false,
      }));
      setIncomeSources(initialIncomeSources);
      setEditingIncomeTempId(null); // Reset any inline income edit form

    }
  }, [currentUserData, currentIncomeSources, isOpen]);

  if (!isOpen) return null;

  // --- HANDLERS: PERSONAL DETAILS ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS: GOALS ---
  const handleGoalChange = (id, field, value) => {
    setGoals(prevGoals => prevGoals.map(goal =>
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const addNewGoal = () => {
    const newGoalId = `new_goal_${Date.now()}`;
    setGoals(prevGoals => [...prevGoals, { id: newGoalId, original_id: null, title: '', description: '', isEditing: true, isNew: true }]);
  };

  const toggleGoalEdit = (id) => {
    setGoals(prevGoals => prevGoals.map(goal => {
      if (goal.id === id) {
        // If finishing editing a new unsaved goal and it's empty, remove it (or mark for removal)
        if (goal.isEditing && goal.isNew && !goal.title && !goal.description) {
          return null; // Will be filtered out later
        }
        return { ...goal, isEditing: !goal.isEditing, isNew: goal.isNew && !goal.title && !goal.description ? true : false };
      }
      return goal;
    }).filter(goal => goal !== null)); // Filter out nulls (empty new goals)
  };

  const deleteGoal = (id) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
  };

  // Goal Drag-and-Drop Handlers
  const handleGoalDragStart = (e, index) => {
    draggedGoalIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Optional: style the dragged item
    e.currentTarget.classList.add("opacity-50", "border-dashed");
  };

  const handleGoalDragEnter = (e, index) => {
    draggedOverGoalIndex.current = index;
  };

  const handleGoalDragEnd = (e) => {
    e.currentTarget.classList.remove("opacity-50", "border-dashed");
    const fromIndex = draggedGoalIndex.current;
    const toIndex = draggedOverGoalIndex.current;

    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      const updatedGoals = [...goals];
      const [draggedItem] = updatedGoals.splice(fromIndex, 1);
      updatedGoals.splice(toIndex, 0, draggedItem);
      setGoals(updatedGoals);
    }
    draggedGoalIndex.current = null;
    draggedOverGoalIndex.current = null;
  };

  const handleGoalDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };


  // --- HANDLERS: INCOME SOURCES ---
  const handleIncomeFieldChange = (e) => {
    const { name, value } = e.target;
    setCurrentIncomeForm(prev => ({ ...prev, [name]: value }));
  };

  const startAddIncome = () => {
    setEditingIncomeTempId('new'); // Special ID for new income form
    setCurrentIncomeForm({ income_source: '', monthly_income: '', description: '' });
  };

  const startEditIncome = (income) => {
    setEditingIncomeTempId(income.tempId);
    setCurrentIncomeForm({
      income_source: income.income_source,
      monthly_income: income.monthly_income,
      description: income.description,
    });
  };

  const cancelEditIncome = () => {
    setEditingIncomeTempId(null);
    setCurrentIncomeForm({ income_source: '', monthly_income: '', description: '' });
  };

  const saveIncomeChanges = () => {
    if (!currentIncomeForm.income_source || !currentIncomeForm.monthly_income) {
      setError("Income source name and monthly amount are required.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (editingIncomeTempId === 'new') { // Adding a new income
      const newIncome = {
        tempId: `new_inc_${Date.now()}`,
        income_id: null, // Will be assigned by backend
        ...currentIncomeForm,
        monthly_income: String(parseFloat(currentIncomeForm.monthly_income) || 0),
        isEditing: false,
        isNew: true,
        toBeDeleted: false,
      };
      setIncomeSources(prev => [...prev, newIncome]);
    } else { // Editing an existing income
      setIncomeSources(prev => prev.map(inc =>
        inc.tempId === editingIncomeTempId
          ? { ...inc, ...currentIncomeForm, monthly_income: String(parseFloat(currentIncomeForm.monthly_income) || 0), isEditing: false, isNew: inc.isNew } // preserve isNew if it was new and just edited
          : inc
      ));
    }
    cancelEditIncome(); // Clear form and editing state
    setError(null);
  };

  const deleteIncomeSource = (tempIdToDelete) => {
    setIncomeSources(prev => prev.map(inc =>
      inc.tempId === tempIdToDelete ? { ...inc, toBeDeleted: true } : inc
    ));
  };


  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 1. Prepare Personal Details Payload
    const profilePayload = {
      age: formData.age ? parseInt(formData.age, 10) : null,
      num_children: formData.num_children ? parseInt(formData.num_children, 10) : null,
      marital_status: formData.marital_status || null,
      retirement_status: formData.retirement_status || null, // This is employment status
      gender: formData.gender || null,
    };

    // 2. Prepare Goals Payload (ordered)
    // API expects: { "1": {title, desc}, "2": {title, desc}, ... }
    const goalsPayload = goals.reduce((acc, goal, index) => {
      if (goal.title || goal.description) { // Only include goals with content
        acc[String(index + 1)] = { title: goal.title, description: goal.description };
      }
      return acc;
    }, {});
    profilePayload.goals = goalsPayload; // Add goals to profile payload

    // 3. Prepare Income Changes (for onSave handler)
    const incomeChanges = {
      newIncomes: incomeSources.filter(inc => inc.isNew && !inc.toBeDeleted && !inc.income_id).map(inc => ({
        income_source: inc.income_source,
        monthly_income: parseFloat(inc.monthly_income) || 0,
        description: inc.description || null,
      })),
      updatedIncomes: incomeSources.filter(inc => !inc.isNew && !inc.toBeDeleted && inc.income_id).map(inc => ({
        income_id: inc.income_id,
        income_source: inc.income_source,
        monthly_income: parseFloat(inc.monthly_income) || 0,
        description: inc.description || null,
      })),
      deletedIncomeIds: incomeSources.filter(inc => inc.toBeDeleted && inc.income_id).map(inc => inc.income_id),
    };
    
    try {
      // onSave now receives both profile data and structured income changes
      await onSave({ profileData: profilePayload, incomeChanges });
      setSuccessMessage("Profile updated successfully!");
      // Optional: Close modal after a short delay to show success message
      // setTimeout(() => {
      //   onClose();
      // }, 1500);
      // Or let ProfilePage handle closing on successful refresh.
    } catch (err) {
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <Card className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg transform transition-all duration-300 scale-95 opacity-0 animate-modalFadeIn max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 pb-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <CardTitle icon={null} className="text-xl">Edit Profile, Income & Goals</CardTitle>
            <CardDescription>Update your personal details, income sources, and financial goals.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-8 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <form id="editProfileForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" value={formData.age} onChange={handleFormChange} placeholder="Your age" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select id="gender" name="gender" value={formData.gender} onChange={handleFormChange} className="mt-1 w-full">
                    <option value="">Select Gender</option>
                    {genderOptions.map(status => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="num_children">Number of Children</Label>
                  <Input id="num_children" name="num_children" type="number" value={formData.num_children} onChange={handleFormChange} placeholder="e.g., 0" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  <Select id="marital_status" name="marital_status" value={formData.marital_status} onChange={handleFormChange} className="mt-1 w-full">
                    <option value="">Select Marital Status</option>
                    {maritalStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="retirement_status">Employment Status</Label>
                  <Select id="retirement_status" name="retirement_status" value={formData.retirement_status} onChange={handleFormChange} className="mt-1 w-full">
                    <option value="">Select Employment Status</option>
                    {retirementStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
              </div>
            </section>

            {/* Income Sources Section */}
            <section>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <DollarSign size={20} className="mr-2 text-green-600 dark:text-green-400"/> Income Sources
                </h3>
                {editingIncomeTempId === null && ( // Show "Add" only if not currently editing/adding another
                  <Button type="button" variant="ghost" onClick={startAddIncome} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500">
                    <PlusCircle size={18} className="mr-1.5" /> Add Income
                  </Button>
                )}
              </div>

              {/* Form for adding/editing an income source */}
              {editingIncomeTempId !== null && (
                <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-700/30 mb-4 space-y-3">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
                    {editingIncomeTempId === 'new' ? 'Add New Income' : 'Edit Income'}
                  </h4>
                  <div>
                    <Label htmlFor="income_source_form">Source Name</Label>
                    <Input id="income_source_form" name="income_source" type="text" value={currentIncomeForm.income_source} onChange={handleIncomeFieldChange} placeholder="e.g., Salary" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="monthly_income_form">Monthly Amount</Label>
                    <Input id="monthly_income_form" name="monthly_income" type="number" step="0.01" value={currentIncomeForm.monthly_income} onChange={handleIncomeFieldChange} placeholder="e.g., 5000.00" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="income_description_form">Description (Optional)</Label>
                    <Textarea id="income_description_form" name="description" value={currentIncomeForm.description} onChange={handleIncomeFieldChange} placeholder="e.g., Main job" className="mt-1 h-20" />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={cancelEditIncome}>Cancel</Button>
                    <Button type="button" variant="default" size="sm" onClick={saveIncomeChanges} icon={Save}>Save Income</Button>
                  </div>
                </div>
              )}

              {/* List of income sources */}
              <div className="space-y-3">
                {incomeSources.filter(inc => !inc.toBeDeleted).length === 0 && editingIncomeTempId === null && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No income sources. Click "Add Income" to create one.</p>
                )}
                {incomeSources.filter(inc => !inc.toBeDeleted).map((income) => (
                  <div key={income.tempId} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{income.income_source || "(No name)"}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Amount: {formatCurrency(parseFloat(income.monthly_income) || 0)}</p>
                      {income.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-pre-wrap">{income.description}</p>}
                    </div>
                    <div className="flex space-x-1.5 flex-shrink-0 ml-2">
                      <Button type="button" variant="ghost" size="icon" onClick={() => startEditIncome(income)} className="p-1 h-auto text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Edit income">
                        <Edit2 size={16} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => deleteIncomeSource(income.tempId)} className="p-1 h-auto text-gray-500 hover:text-red-600 dark:hover:text-red-400" aria-label="Delete income">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Financial Goals Section */}
            <section>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <Target size={20} className="mr-2 text-blue-600 dark:text-blue-400"/> Financial Goals (Drag to Reorder)
                </h3>
                <Button type="button" variant="ghost" onClick={addNewGoal} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                  <PlusCircle size={18} className="mr-1.5" /> Add Goal
                </Button>
              </div>
              {goals.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No financial goals set. Click "Add Goal" to create one.</p>
              )}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2"> {/* Scrollable area for goals */}
                {goals.map((goal, index) => (
                  <div
                    key={goal.id}
                    draggable
                    onDragStart={(e) => handleGoalDragStart(e, index)}
                    onDragEnter={(e) => handleGoalDragEnter(e, index)}
                    onDragEnd={handleGoalDragEnd}
                    onDragOver={handleGoalDragOver}
                    className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 cursor-grab active:cursor-grabbing"
                  >
                    {goal.isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                           <GripVertical className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                           <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Priority {index + 1}</span>
                        </div>
                        <div>
                          <Label htmlFor={`goal_title_${goal.id}`}>Goal Title</Label>
                          <Input id={`goal_title_${goal.id}`} type="text" value={goal.title} onChange={(e) => handleGoalChange(goal.id, 'title', e.target.value)} placeholder="e.g., Save for downpayment" className="mt-1 text-sm"/>
                        </div>
                        <div>
                          <Label htmlFor={`goal_desc_${goal.id}`}>Description</Label>
                          <Textarea id={`goal_desc_${goal.id}`} value={goal.description} onChange={(e) => handleGoalChange(goal.id, 'description', e.target.value)} placeholder="e.g., Aiming for $20,000 in 2 years" className="mt-1 text-sm h-20"/>
                        </div>
                        <div className="flex justify-end space-x-2 pt-1">
                          <Button type="button" variant="ghost" size="sm" onClick={() => toggleGoalEdit(goal.id)} className="text-xs">Done Editing</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <GripVertical className="h-5 w-5 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2 p-1 bg-blue-100 dark:bg-blue-700/30 rounded">Priority {index + 1}</span>
                                    <p className="font-medium text-gray-800 dark:text-gray-100 inline">{goal.title || "(No title)"}</p>
                                </div>
                                <div className="flex space-x-1.5 flex-shrink-0 ml-2">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => toggleGoalEdit(goal.id)} className="p-1 h-auto text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" aria-label="Edit goal"> <Edit2 size={16} /> </Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="p-1 h-auto text-gray-500 hover:text-red-600 dark:hover:text-red-400" aria-label="Delete goal"> <Trash2 size={16} /> </Button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mt-1 ml-6">{goal.description || "(No description)"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            {/* Form submission button is in CardFooter */}
          </form>
        </CardContent>

        <CardFooter className="border-t dark:border-gray-700 p-6 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="editProfileForm" icon={Save} disabled={isLoading} className="min-w-[160px]">
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
        /* Style for indicating a draggable item */
        [draggable] {
          user-select: none; /* Prevent text selection during drag */
        }
      `}</style>
    </div>
  );
};
