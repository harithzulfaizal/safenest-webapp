// src/pages/InsightsPage.jsx
// Fetches and displays financial insights for the user
import React, { useState, useEffect, useCallback } from 'react';
import InsightsList from '../components/features/insights/InsightsList'; // Default import
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react'; // Added RefreshCw for regenerate button
import { API_BASE_URL } from '../apiConfig';

export const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true); // For initial load
  const [regenerating, setRegenerating] = useState(false); // For regeneration process
  const [error, setError] = useState(null); // For critical errors or warnings
  const { user, loading: userLoading, error: userError } = useUser();

  // Fetches the LATEST saved insights (GET request)
  const fetchLatestInsights = useCallback(async (userId, isFallbackAfterRegenError = false) => {
    if (!regenerating && !isFallbackAfterRegenError) {
      setLoading(true);
    }
    // Don't clear error if this is a fallback, as we want to keep the regeneration error message
    if (!isFallbackAfterRegenError) {
        setError(null);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/insights/latest`);

      if (!response.ok) {
        const errorText = await response.text();

        // If it's a 404 or 500 during initial fetch (not a fallback), treat as "no insights"
        if ((response.status === 404 || response.status === 500) && !isFallbackAfterRegenError) {
          console.warn(`Received status ${response.status} from /insights/latest. User may not have insights yet or an unexpected server issue occurred. Treating as no insights available. Response: ${errorText}`);
          setInsights([]);
          return;
        }
        // If it's an error during fallback, or a different error, throw it to be caught
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Failed to fetch latest insights: ${response.status} - ${errorData.detail || 'Unknown API error'}`);
        } catch (jsonError) {
          console.error("Non-JSON error response (fetchLatestInsights) for status " + response.status + ":", errorText);
          const shortErrorText = errorText.length > 100 ? errorText.substring(0, 100) + "..." : errorText;
          throw new Error(`Failed to fetch latest insights: ${response.status}. Server returned non-JSON response: ${shortErrorText}`);
        }
      }

      const data = await response.json();
      const rawInsightsData = data.insights;
      const transformedInsights = [];

      if (rawInsightsData && typeof rawInsightsData === 'object' && !Array.isArray(rawInsightsData)) {
        if (rawInsightsData.debt_insights) {
          transformedInsights.push({
            id: data.insight_id ? `debt_${data.insight_id}` : `debt_${Date.now()}`,
            title: rawInsightsData.debt_insights.financial_goal || "Debt Management Insight",
            explanation: rawInsightsData.debt_insights.detailed_insight,
            impact: rawInsightsData.debt_insights.implications,
            nextSteps: rawInsightsData.debt_insights.recommended_actions
              ? rawInsightsData.debt_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0)
              : [],
          });
        }
        if (rawInsightsData.savings_insights) {
          transformedInsights.push({
            id: data.insight_id ? `savings_${data.insight_id}` : `savings_${Date.now() + 1}`,
            title: rawInsightsData.savings_insights.financial_goal || "Savings Strategy Insight",
            explanation: rawInsightsData.savings_insights.detailed_insight,
            impact: rawInsightsData.savings_insights.implications,
            nextSteps: rawInsightsData.savings_insights.recommended_actions
              ? rawInsightsData.savings_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0)
              : [],
          });
        }
      } else if (Array.isArray(rawInsightsData)) {
         transformedInsights.push(...rawInsightsData.map((insight, index) => ({
            id: insight.id || `${data.insight_id}_${index}` || `custom_insight_${Date.now() + index}`,
            title: insight.title || "Financial Insight",
            explanation: insight.explanation || "No detailed explanation provided.",
            impact: insight.impact || "Impact not specified.",
            nextSteps: Array.isArray(insight.nextSteps) ? insight.nextSteps : (typeof insight.nextSteps === 'string' ? insight.nextSteps.split('\n').map(s => s.trim()).filter(s => s) : [])
        })));
      }
      setInsights(transformedInsights);
      // If this was a successful fallback fetch after a regen error, the error message about regen failure is still shown.
    } catch (err) {
      console.error("Error fetching latest insights:", err);
      // If this is a fallback after regen error, we prioritize the regen error message.
      // Otherwise, set this fetch error.
      if (!isFallbackAfterRegenError) {
        setError(err.message);
      } else {
        // If fallback also fails, append to the existing regen error or set a new one.
         setError(prevError => `${prevError || 'Regeneration failed.'} Additionally, failed to fetch previous insights: ${err.message}`);
      }
      setInsights([]); // Clear insights if fetch fails
    } finally {
      if (!regenerating && !isFallbackAfterRegenError) {
        setLoading(false);
      }
    }
  }, [regenerating]);

  // Generates NEW insights (POST request) and then fetches them
  const handleRegenerateInsights = useCallback(async () => {
    if (!user || !user._rawProfile || !user._rawProfile.user_id) {
      setError("User ID not available. Cannot regenerate insights.");
      return;
    }
    const userId = user._rawProfile.user_id;
    setRegenerating(true);
    setError(null); // Clear previous errors before regenerating
    let regenerationFailed = false;
    let regenErrorMessage = "Insights regeneration failed. Please try again. Showing previously available insights.";

    try {
      const regenerateResponse = await fetch(`${API_BASE_URL}/users/${userId}/insights/financial_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!regenerateResponse.ok) {
        regenerationFailed = true; // Mark as failed
        const errorText = await regenerateResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          regenErrorMessage = `Insights regeneration failed (${regenerateResponse.status}): ${errorData.detail || 'Unknown API error'}. Please try again. Showing previously available insights.`;
        } catch (jsonError) {
          console.error("Non-JSON error response (handleRegenerateInsights):", errorText);
          const shortErrorText = errorText.length > 100 ? errorText.substring(0, 100) + "..." : errorText;
          regenErrorMessage = `Insights regeneration failed (${regenerateResponse.status}): Server returned non-JSON response (${shortErrorText}). Please try again. Showing previously available insights.`;
        }
        // Do not throw here, proceed to fetchLatestInsights in finally
      } else {
         console.log("Insights regenerated successfully via POST, now fetching latest from DB...");
      }
    } catch (err) {
      // Catch network errors or other unexpected issues during POST
      regenerationFailed = true;
      console.error("Error during insight regeneration POST request:", err);
      regenErrorMessage = `Insights regeneration failed: ${err.message}. Please try again. Showing previously available insights.`;
    } finally {
      if (regenerationFailed) {
        setError(regenErrorMessage); // Set the specific warning message
      }
      // Always attempt to fetch latest insights, whether regeneration succeeded or failed
      await fetchLatestInsights(userId, regenerationFailed);
      setRegenerating(false);
    }
  }, [user, fetchLatestInsights]);

  useEffect(() => {
    if (!userLoading) {
      if (userError) {
        setError(`User context error: ${userError}. Cannot fetch insights.`);
        setLoading(false);
      } else if (user && user._rawProfile && user._rawProfile.user_id) {
        fetchLatestInsights(user._rawProfile.user_id);
      } else if (!userLoading) {
        setError("User ID not available. Cannot fetch insights.");
        setLoading(false);
        setInsights([]);
      }
    }
  }, [user, userLoading, userError, fetchLatestInsights]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Insights & Recommendations
        </h1>
        <Button onClick={handleRegenerateInsights} disabled={regenerating || loading} variant="outline" icon={regenerating ? null : RefreshCw}>
          {regenerating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Regenerating...
            </div>
          ) : 'Regenerate Insights'}
        </Button>
      </div>

      {/* Display error/warning messages first if they exist, regardless of loading state for insights list */}
      {error && (
        <Card className={`border-orange-500 bg-orange-50 dark:bg-orange-900/20`}>
          <CardContent className="flex flex-col justify-center items-center p-4 text-center">
            <AlertTriangle size={28} className="text-orange-500 dark:text-orange-400 mb-2" />
            <p className="text-orange-700 dark:text-orange-300 font-semibold">Notice</p>
            <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Initial Loading State */}
      {loading && !regenerating && !error && (
        <Card>
          <CardContent className="flex justify-center items-center h-48">
            <div role="status" className="flex flex-col items-center">
              <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="text-gray-600 dark:text-gray-400 mt-2">Loading initial insights...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No insights display: shows if not initial loading, no error, no insights, and not currently regenerating */}
      {!loading && !error && insights.length === 0 && !regenerating && (
         <Card>
          <CardContent className="flex flex-col justify-center items-center h-48 p-6 text-center">
            <Info size={32} className="text-blue-500 dark:text-blue-400 mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">No Insights Available</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              There are currently no financial insights to display. Try regenerating them.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights list: shows if insights exist AND ( (it's not initial loading AND no error) OR it's currently regenerating ) */}
      {insights.length > 0 && ((!loading && !error) || regenerating) && (
        <InsightsList insights={insights} />
      )}
    </div>
  );
};
