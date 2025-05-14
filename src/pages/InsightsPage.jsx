// src/pages/InsightsPage.jsx
// Fetches and displays financial insights for the user
import React, { useEffect, useCallback } from 'react'; // Removed useState
import InsightsList from '../components/features/insights/InsightsList'; // Default import
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react'; // Added RefreshCw for regenerate button
// API_BASE_URL is no longer needed here as logic is in UserContext

export const InsightsPage = () => {
  const {
    user,
    loading: userLoading, // Renaming to avoid conflict if we had a local 'loading'
    error: userError,     // Renaming to avoid conflict
    insights,
    insightsLoading,
    insightsRegenerating,
    insightsError,
    fetchLatestInsights,
    handleRegenerateInsights,
    setInsightsError // To clear the error modal
  } = useUser();

  // Effect to fetch initial insights if not already loaded and user is available
  useEffect(() => {
    if (!userLoading && !userError && user && user._rawProfile && user._rawProfile.user_id) {
      // Check if insights are empty and not currently loading/regenerating to avoid redundant calls
      if (insights.length === 0 && !insightsLoading && !insightsRegenerating && !insightsError) {
        fetchLatestInsights(user._rawProfile.user_id);
      }
    } else if (!userLoading && (userError || (!user && !userLoading))) {
      // Handle cases where user data itself has an error or user is not available
      // InsightsError might be set by UserContext if user ID is missing for insights
      if (!insightsError && userError) {
        setInsightsError(`User data error: ${userError}. Cannot display insights.`);
      } else if (!insightsError && !user && !userLoading) {
         setInsightsError("User not available. Cannot display insights.");
      }
    }
  }, [
    user, 
    userLoading, 
    userError, 
    insights.length, // Re-run if insights array changes (e.g. after regeneration)
    insightsLoading, 
    insightsRegenerating,
    insightsError, 
    fetchLatestInsights,
    setInsightsError // Added setInsightsError
  ]);

  const onRegenerateClick = useCallback(() => {
    if (user && user._rawProfile && user._rawProfile.user_id) {
      handleRegenerateInsights(user._rawProfile.user_id);
    } else {
      setInsightsError("User ID not available. Cannot regenerate insights.");
    }
  }, [user, handleRegenerateInsights, setInsightsError]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Insights & Recommendations
        </h1>
        <Button onClick={onRegenerateClick} disabled={insightsRegenerating || insightsLoading || userLoading} variant="outline" icon={insightsRegenerating ? null : RefreshCw}>
          {insightsRegenerating ? (
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

      {/* Display error/warning messages from UserContext for insights */}
      {insightsError && (
        <>
          {insightsError.startsWith("Insights regeneration failed") ? (
            // Modal for regeneration failure
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="alertdialog" aria-modal="true" aria-labelledby="regenErrorModalTitle" aria-describedby="regenErrorModalDesc">
              <Card className="border-orange-500 bg-white dark:bg-slate-900 w-full max-w-lg shadow-2xl rounded-lg">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <AlertTriangle size={36} className="text-orange-500 dark:text-orange-400 mb-4" />
                  <h2 id="regenErrorModalTitle" className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Insight Regeneration Issue</h2>
                  <p id="regenErrorModalDesc" className="text-sm text-slate-600 dark:text-slate-300 mb-6">{insightsError}</p> {/* Added mb-6 for spacing */}
                  <Button onClick={() => setInsightsError(null)} variant="outline" className="w-full sm:w-auto">
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Standard error display for other insights errors
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/30 my-4" role="alert"> {/* Added my-4 for spacing */}
              <CardContent className="flex items-start p-4"> {/* Changed to items-start for better text alignment with icon */}
                <AlertTriangle size={24} className="text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-1" /> {/* Added mt-1 for alignment */}
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{insightsError}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Initial Loading State for insights */}
      {insightsLoading && !insightsRegenerating && !insightsError && (
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
      {!insightsLoading && !insightsError && insights.length === 0 && !insightsRegenerating && (
         <Card>
          <CardContent className="flex flex-col justify-center items-center h-48 p-6 text-center">
            <Info size={32} className="text-blue-500 dark:text-blue-400 mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-semibold">No Insights Available</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              There are currently no financial insights to display. Try regenerating them or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights list: shows if insights exist AND ( (it's not initial loading AND no insightsError) OR it's currently insightsRegenerating ) */}
      {/* Also ensures user is loaded and no userError before trying to show list based on insights */}
      {!userLoading && !userError && insights.length > 0 && ((!insightsLoading && !insightsError) || insightsRegenerating) && (
        <InsightsList insights={insights} />
      )}
    </div>
  );
};
