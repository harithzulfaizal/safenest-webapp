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
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true, message: `${operationDesc} successful with no content.`}; // Ensure an object is returned for no content
  }
  try {
    return await response.json();
  } catch (e) {
    console.warn(`Response for ${operationDesc} was not JSON. Status: ${response.status}`);
    return { success: true, status: response.status, message: `Operation ${operationDesc} successful but no JSON content returned.` };
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
 * @returns {Promise<object>} The updated user profile from the API.
 */
export const updateUserProfileAPI = async (userId, profileData) => {
  if (!userId) throw new Error("User ID is required to update profile.");
  if (!profileData) throw new Error("Profile data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await handleApiResponse(response, "update user profile");
  } catch (error) {
    console.error("Error in updateUserProfileAPI:", error);
    throw error;
  }
};

// --- Income CRUD Functions ---
/**
 * Creates a new income source for a user.
 * @param {number} userId The ID of the user.
 * @param {object} incomeData The income data to create.
 * @returns {Promise<object>} The created income detail from the API.
 */
export const createIncomeDetailAPI = async (userId, incomeData) => {
    if (!userId) throw new Error("User ID is required for creating income.");
    if (!incomeData) throw new Error("Income data is required.");
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/income`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomeData),
        });
        return await handleApiResponse(response, "create income detail");
    } catch (error) { console.error("Error in createIncomeDetailAPI:", error); throw error; }
};

/**
 * Fetches all income sources for a user.
 * @param {number} userId The ID of the user.
 * @returns {Promise<Array<object>>} A list of income details.
 */
export const fetchUserIncomeAPI = async (userId) => {
    if (!userId) throw new Error("User ID is required for fetching income.");
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/income`);
        return await handleApiResponse(response, "fetch user income");
    } catch (error) { console.error("Error in fetchUserIncomeAPI:", error); throw error; }
};

/**
 * Updates an existing income source for a user.
 * @param {number} userId The ID of the user.
 * @param {number} incomeId The ID of the income source to update.
 * @param {object} incomeData The income data to update.
 * @returns {Promise<object>} The updated income detail from the API.
 */
export const updateIncomeDetailAPI = async (userId, incomeId, incomeData) => {
    if (!userId) throw new Error("User ID is required for updating income.");
    if (!incomeId) throw new Error("Income ID is required for updating income.");
    if (!incomeData) throw new Error("Income data is required.");
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/income/${incomeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomeData),
        });
        return await handleApiResponse(response, "update income detail");
    } catch (error) { console.error("Error in updateIncomeDetailAPI:", error); throw error; }
};

/**
 * Deletes an income source for a user.
 * @param {number} userId The ID of the user.
 * @param {number} incomeId The ID of the income source to delete.
 * @returns {Promise<object>} Confirmation of deletion.
 */
export const deleteIncomeDetailAPI = async (userId, incomeId) => {
    if (!userId) throw new Error("User ID is required for deleting income.");
    if (!incomeId) throw new Error("Income ID is required for deleting income.");
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/income/${incomeId}`, {
            method: 'DELETE',
        });
        return await handleApiResponse(response, "delete income detail");
    } catch (error) { console.error("Error in deleteIncomeDetailAPI:", error); throw error; }
};


// --- Debt CRUD Functions ---
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
  } catch (error) { console.error("Error in createDebtDetailAPI:", error); throw error; }
};

export const fetchUserDebtsAPI = async (userId) => {
  if (!userId) throw new Error("User ID is required for fetching debts.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts`);
    return await handleApiResponse(response, "fetch user debts");
  } catch (error) { console.error("Error in fetchUserDebtsAPI:", error); throw error; }
};

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
  } catch (error) { console.error("Error in updateDebtDetailAPI:", error); throw error; }
};

export const deleteDebtDetailAPI = async (userId, debtId) => {
  if (!userId) throw new Error("User ID is required for deleting debt.");
  if (!debtId) throw new Error("Debt ID is required for deleting debt.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/debts/${debtId}`, {
      method: 'DELETE',
    });
    return await handleApiResponse(response, "delete debt detail");
  } catch (error) { console.error("Error in deleteDebtDetailAPI:", error); throw error; }
};

// --- Expense CRUD Functions ---
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
  } catch (error) { console.error("Error in createExpenseDetailAPI:", error); throw error; }
};

export const fetchUserExpensesAPI = async (userId) => {
  if (!userId) throw new Error("User ID is required for fetching expenses.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses`);
    return await handleApiResponse(response, "fetch user expenses");
  } catch (error) { console.error("Error in fetchUserExpensesAPI:", error); throw error; }
};

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
  } catch (error) { console.error("Error in updateExpenseDetailAPI:", error); throw error; }
};

export const deleteExpenseDetailAPI = async (userId, expenseId) => {
  if (!userId) throw new Error("User ID is required for deleting expense.");
  if (!expenseId) throw new Error("Expense ID is required for deleting expense.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    return await handleApiResponse(response, "delete expense detail");
  } catch (error) { console.error("Error in deleteExpenseDetailAPI:", error); throw error; }
};

// --- Financial Knowledge CRUD Functions ---

/**
 * Adds or updates a financial knowledge entry for a user.
 * (Corresponds to POST /users/{user_id}/financial_knowledge)
 * @param {number} userId The ID of the user.
 * @param {{ category: string, level: number }} knowledgeData The knowledge data.
 * @returns {Promise<object>} The created or updated financial knowledge entry.
 */
export const addOrUpdateUserFinancialKnowledgeAPI = async (userId, knowledgeData) => {
  if (!userId) throw new Error("User ID is required for financial knowledge.");
  if (!knowledgeData || !knowledgeData.category || knowledgeData.level === undefined) {
    throw new Error("Category and level are required for financial knowledge.");
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/financial_knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knowledgeData), // API expects { "category": "string", "level": integer }
    });
    return await handleApiResponse(response, "add/update financial knowledge");
  } catch (error) {
    console.error("Error in addOrUpdateUserFinancialKnowledgeAPI:", error);
    throw error;
  }
};

/**
 * Updates the level for a specific financial knowledge category for a user.
 * (Corresponds to PUT /users/{user_id}/financial_knowledge/{category})
 * @param {number} userId The ID of the user.
 * @param {string} category The category to update.
 * @param {{ level: number }} levelData The new level.
 * @returns {Promise<object>} The updated financial knowledge entry.
 */
export const updateUserFinancialKnowledgeLevelAPI = async (userId, category, levelData) => {
  if (!userId) throw new Error("User ID is required.");
  if (!category) throw new Error("Category is required to update knowledge level.");
  if (!levelData || levelData.level === undefined) throw new Error("Level data is required.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/financial_knowledge/${encodeURIComponent(category)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(levelData), // API expects { "level": integer }
    });
    return await handleApiResponse(response, `update financial knowledge level for ${category}`);
  } catch (error) {
    console.error("Error in updateUserFinancialKnowledgeLevelAPI:", error);
    throw error;
  }
};

/**
 * Removes a financial knowledge category from a user.
 * (Corresponds to DELETE /users/{user_id}/financial_knowledge/{category})
 * @param {number} userId The ID of the user.
 * @param {string} category The category to remove.
 * @returns {Promise<object>} Confirmation of deletion.
 */
export const removeUserFinancialKnowledgeAPI = async (userId, category) => {
  if (!userId) throw new Error("User ID is required.");
  if (!category) throw new Error("Category is required to remove knowledge.");
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/financial_knowledge/${encodeURIComponent(category)}`, {
      method: 'DELETE',
    });
    return await handleApiResponse(response, `remove financial knowledge for ${category}`);
  } catch (error) {
    console.error("Error in removeUserFinancialKnowledgeAPI:", error);
    throw error;
  }
};

/**
 * Fetches all defined financial knowledge categories and their levels/descriptions.
 * (Corresponds to GET /financial_knowledge_definitions)
 * @returns {Promise<Array<object>>} A list of financial knowledge definitions.
 */
export const fetchFinancialKnowledgeDefinitionsAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/financial_knowledge_definitions`);
        return await handleApiResponse(response, "fetch financial knowledge definitions");
    } catch (error) {
        console.error("Error in fetchFinancialKnowledgeDefinitionsAPI:", error);
        throw error;
    }
};
