// src/apiService.js
// Contains functions for making API calls to the backend.
import { API_BASE_URL } from './apiConfig';

/**
 * Updates a user's profile.
 * @param {number} userId The ID of the user.
 * @param {object} profileData The profile data to update.
 * Expected fields in profileData: age, num_children, marital_status, retirement_status, goals (as an object).
 * @returns {Promise<object>} The updated user profile from the API.
 * @throws {Error} If the API request fails.
 */
export const updateUserProfileAPI = async (userId, profileData) => {
  if (!userId) {
    throw new Error("User ID is required to update profile.");
  }
  if (!profileData) {
    throw new Error("Profile data is required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Include Authorization headers if your API requires them
        // 'Authorization': `Bearer ${your_auth_token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      console.error("API Error Data:", errorData);
      throw new Error(`Failed to update profile: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateUserProfileAPI:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

/**
 * Fetches comprehensive user details.
 * @param {number} userId The ID of the user.
 * @returns {Promise<object>} The comprehensive user details.
 * @throws {Error} if the API request fails.
 */
export const fetchComprehensiveUserDetailsAPI = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/comprehensive_details`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
            throw new Error(`Failed to fetch comprehensive user data: ${response.status} - ${errorData.detail}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in fetchComprehensiveUserDetailsAPI:", error);
        throw error;
    }
};

// Add other API functions here as needed (e.g., for debts, income, expenses)
// Example for creating an income detail:
/*
export const createIncomeDetailAPI = async (userId, incomeData) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incomeData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
    throw new Error(`Failed to create income detail: ${response.status} - ${errorData.detail}`);
  }
  return await response.json();
};
*/
