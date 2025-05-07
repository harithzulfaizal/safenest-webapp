// src/components/features/insights/InsightsList.jsx
// Displays a list of financial insights using an accordion
import React, { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/Accordion';
import { Card, CardContent } from '../../ui/Card';

export const InsightsList = ({ insights }) => {
  const [openItemId, setOpenItemId] = useState(null);

  const toggleItem = (id) => setOpenItemId(openItemId === id ? null : id);

  if (!insights) return <p>Loading insights...</p>;

  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              No insights available at the moment. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion>
          {insights.map((insight) => (
            <AccordionItem
              key={insight.id}
              value={`item-${insight.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <AccordionTrigger
                onClick={() => toggleItem(insight.id)}
                isOpen={openItemId === insight.id}
                className="p-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full"
              >
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {insight.title}
                </span>
              </AccordionTrigger>

              <AccordionContent isOpen={openItemId === insight.id} className="px-4">
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    <strong className="font-medium text-gray-800 dark:text-gray-200">
                      Explanation:
                    </strong>
                    {' '}{insight.explanation}
                  </p>
                  <p>
                    <strong className="font-medium text-gray-800 dark:text-gray-200">
                      Calculated Impact:
                    </strong>
                    <pre className="whitespace-pre-wrap font-sans">{insight.impact}</pre>
                  </p>
                  <div>
                    <strong className="font-medium text-gray-800 dark:text-gray-200 block mb-1">
                      Actionable Next Steps:
                    </strong>
                    <ul className="list-disc list-inside space-y-1">
                      {insight.nextSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default InsightsList;
