// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Label, Select } from '../ui/Form'; // Assuming Select is part of Form.jsx or you'll add it
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';

export const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) => {
  const [formData, setFormData] = useState({
    age: '',
    num_children: '',
    marital_status: '',
    retirement_status: '',
    // goals: {} // For simplicity, goals editing will be handled separately or as raw JSON initially
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUserData?.profile) { // Check if profile exists in currentUserData
      setFormData({
        age: currentUserData.profile.age || '',
        num_children: currentUserData.profile.num_children || '',
        marital_status: currentUserData.profile.marital_status || '',
        retirement_status: currentUserData.profile.retirement_status || '',
        // goals: currentUserData.profile.goals || {},
      });
    } else if (currentUserData) { // Fallback if profile structure is flatter (adjust as per actual data structure)
        setFormData({
            age: currentUserData.age || '',
            num_children: currentUserData.num_children || '',
            marital_status: currentUserData.marital_status || '',
            retirement_status: currentUserData.retirement_status || '',
            // goals: currentUserData.goals || {},
        });
    }
  }, [currentUserData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Construct the payload ensuring numbers are numbers
      const payload = {
        age: formData.age ? parseInt(formData.age, 10) : null,
        num_children: formData.num_children ? parseInt(formData.num_children, 10) : null,
        marital_status: formData.marital_status || null,
        retirement_status: formData.retirement_status || null,
        // goals: formData.goals // Pass goals if editing them
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle icon={null}>Edit Profile</CardTitle>
            <CardDescription>Update your personal profile details.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="num_children">Number of Children</Label>
              <Input
                id="num_children"
                name="num_children"
                type="number"
                value={formData.num_children}
                onChange={handleChange}
                placeholder="Enter number of children"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="marital_status">Marital Status</Label>
              <Select
                id="marital_status"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className="mt-1 w-full"
              >
                <option value="">Select Marital Status</option>
                {maritalStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="retirement_status">Retirement Status</Label>
               <Select
                id="retirement_status"
                name="retirement_status"
                value={formData.retirement_status}
                onChange={handleChange}
                className="mt-1 w-full"
              >
                <option value="">Select Retirement Status</option>
                {retirementStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
            {/* Goals editing can be added here later. For example, a textarea for JSON:
            <div>
              <Label htmlFor="goals">Goals (JSON format)</Label>
              <textarea
                id="goals"
                name="goals"
                value={typeof formData.goals === 'string' ? formData.goals : JSON.stringify(formData.goals, null, 2)}
                onChange={(e) => setFormData(prev => ({...prev, goals: e.target.value}))}
                placeholder='e.g., { "vacation": "Save $5000 for a trip" }'
                className="mt-1 w-full h-24 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
