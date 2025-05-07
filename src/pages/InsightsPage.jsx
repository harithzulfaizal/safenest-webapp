// src/pages/InsightsPage.jsx
// Fetches and displays financial insights for the user
import React, { useState, useEffect } from 'react';
import InsightsList from '../components/features/insights/InsightsList'; // Default import
import { API_BASE_URL, DEFAULT_USER_ID } from '../apiConfig';
import { Card, CardContent } from '../components/ui/Card';

export const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users/${DEFAULT_USER_ID}/insights/financial_report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(response);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
          throw new Error(`Failed to fetch insights: ${response.status} - ${errorData.detail}`);
        }
        const data = await response.json();

        const transformedInsights = [];
        if (data.debt_insights) {
          transformedInsights.push({
            id: 'debt_insight_1', // Ensure unique IDs if more insights are added
            title: data.debt_insights.financial_goal || "Debt Management Insight",
            explanation: data.debt_insights.detailed_insight,
            impact: data.debt_insights.implications, // Keep as is for <pre>
            nextSteps: data.debt_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0),
          });
        }
        if (data.savings_insights) {
          transformedInsights.push({
            id: 'savings_insight_1',
            title: data.savings_insights.financial_goal || "Savings Strategy Insight",
            explanation: data.savings_insights.detailed_insight,
            impact: data.savings_insights.implications, // Keep as is for <pre>
            nextSteps: data.savings_insights.recommended_actions.split('\n').map(s => s.replace(/^-/, '').trim()).filter(s => s.length > 0),
          });
        }
        setInsights(transformedInsights);

      } catch (err) {
        console.error("Error fetching insights:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Insights & Recommendations
      </h1>
      {loading && (
        <Card>
          <CardContent className="flex justify-center items-center h-32">
            <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-32">
            <p className="text-red-600 dark:text-red-400">Error fetching insights:</p>
            <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
      {!loading && !error && (
        <InsightsList insights={insights} />
      )}
    </div>
  );
};
