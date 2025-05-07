// src/apiService.js
// Contains functions for making API calls to the backend.
import { API_BASE_URL } from './apiConfig';

/**
 * Helper function to handle API responses and errors.
 * @param {Response} response The fetch API response object.
 * @param {string} operationDesc Description of the operation for error messages.
 * @returns {Promise<object>} The JSON response from the API.
 * @throws {Error} If the API request fails.
 */
const handleApiResponse = async (response, operationDesc) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status} during ${operationDesc}` }));
    console.error(`API Error during ${operationDesc}:`, errorData);
    throw new Error(`Failed to ${operationDesc}: ${response.status} - ${errorData.detail || 'Unknown API error'}`);
  }
  // For 204 No Content or other success statuses without a body
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {}; // Return an empty object or a specific success indicator
  }
  return await response.json();
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
        return await handleApiResponse(response, "fetch comprehensive user details");
    } catch (error) {
        console.error("Error in fetchComprehensiveUserDetailsAPI:", error);
        throw error;
    }
};

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
      },
      body: JSON.stringify(profileData),
    });
    return await handleApiResponse(response, "update user profile");
  } catch (error) {
    console.error("Error in updateUserProfileAPI:", error);
    throw error;
  }
};

// --- Debt CRUD Functions ---

/**
 * Creates a new debt detail for a user.
 * @param {number} userId The ID of the user.
 * @param {object} debtData The debt data to create.
 * @returns {Promise<object>} The created debt detail.
 */
export const createDebtDetailAPI = async (userId, debtData) => {
  if (!userId) throw new Error("User ID is required for creating debt.");
  if (!debtData) throw new Error("Debt data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debtData),
    });
    return await handleApiResponse(response, "create debt detail");
  } catch (error) {
    console.error("Error in createDebtDetailAPI:", error);
    throw error;
  }
};

/**
 * Fetches all debt details for a user.
 * @param {number} userId The ID of the user.
 * @returns {Promise<Array<object>>} A list of debt details.
 */
export const fetchUserDebtsAPI = async (userId) => {
  if (!userId) throw new Error("User ID is required for fetching debts.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts`);
    return await handleApiResponse(response, "fetch user debts");
  } catch (error) {
    console.error("Error in fetchUserDebtsAPI:", error);
    throw error;
  }
};

/**
 * Updates an existing debt detail for a user.
 * @param {number} userId The ID of the user.
 * @param {number} debtId The ID of the debt to update.
 * @param {object} debtData The debt data to update.
 * @returns {Promise<object>} The updated debt detail.
 */
export const updateDebtDetailAPI = async (userId, debtId, debtData) => {
  if (!userId) throw new Error("User ID is required for updating debt.");
  if (!debtId) throw new Error("Debt ID is required for updating debt.");
  if (!debtData) throw new Error("Debt data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts/${debtId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debtData),
    });
    return await handleApiResponse(response, "update debt detail");
  } catch (error) {
    console.error("Error in updateDebtDetailAPI:", error);
    throw error;
  }
};

/**
 * Deletes a debt detail for a user.
 * @param {number} userId The ID of the user.
 * @param {number} debtId The ID of the debt to delete.
 * @returns {Promise<object>} Confirmation of deletion (often empty).
 */
export const deleteDebtDetailAPI = async (userId, debtId) => {
  if (!userId) throw new Error("User ID is required for deleting debt.");
  if (!debtId) throw new Error("Debt ID is required for deleting debt.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts/${debtId}`, {
      method: 'DELETE',
    });
    // DELETE might return 204 No Content or an empty object on success
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
        throw new Error(`Failed to delete debt: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }
    return response.status === 204 ? {} : await response.json(); // Handle 204 No Content
  } catch (error) {
    console.error("Error in deleteDebtDetailAPI:", error);
    throw error;
  }
};

// --- Expense CRUD Functions ---

/**
 * Creates a new expense detail for a user.
 * @param {number} userId The ID of the user.
 * @param {object} expenseData The expense data to create.
 * @returns {Promise<object>} The created expense detail.
 */
export const createExpenseDetailAPI = async (userId, expenseData) => {
  if (!userId) throw new Error("User ID is required for creating expense.");
  if (!expenseData) throw new Error("Expense data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    return await handleApiResponse(response, "create expense detail");
  } catch (error) {
    console.error("Error in createExpenseDetailAPI:", error);
    throw error;
  }
};

/**
 * Fetches all expense details for a user.
 * @param {number} userId The ID of the user.
 * @returns {Promise<Array<object>>} A list of expense details.
 */
export const fetchUserExpensesAPI = async (userId) => {
  if (!userId) throw new Error("User ID is required for fetching expenses.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses`);
    return await handleApiResponse(response, "fetch user expenses");
  } catch (error) {
    console.error("Error in fetchUserExpensesAPI:", error);
    throw error;
  }
};

/**
 * Updates an existing expense detail for a user.
 * @param {number} userId The ID of the user.
 * @param {number} expenseId The ID of the expense to update.
 * @param {object} expenseData The expense data to update.
 * @returns {Promise<object>} The updated expense detail.
 */
export const updateExpenseDetailAPI = async (userId, expenseId, expenseData) => {
  if (!userId) throw new Error("User ID is required for updating expense.");
  if (!expenseId) throw new Error("Expense ID is required for updating expense.");
  if (!expenseData) throw new Error("Expense data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    return await handleApiResponse(response, "update expense detail");
  } catch (error) {
    console.error("Error in updateExpenseDetailAPI:", error);
    throw error;
  }
};

/**
 * Deletes an expense detail for a user.
 * @param {number} userId The ID of the user.
 * @param {number} expenseId The ID of the expense to delete.
 * @returns {Promise<object>} Confirmation of deletion.
 */
export const deleteExpenseDetailAPI = async (userId, expenseId) => {
  if (!userId) throw new Error("User ID is required for deleting expense.");
  if (!expenseId) throw new Error("Expense ID is required for deleting expense.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
        throw new Error(`Failed to delete expense: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }
    return response.status === 204 ? {} : await response.json(); // Handle 204 No Content
  } catch (error) {
    console.error("Error in deleteExpenseDetailAPI:", error);
    throw error;
  }
};

// Note: Income CRUD functions (createIncomeDetailAPI, etc.) can be added here following the same pattern if needed.
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
