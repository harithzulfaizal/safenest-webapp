// src/components/features/insights/InsightsList.jsx
// Displays a list of financial insights using an accordion
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../ui/Accordion';
import { Card, CardContent } from '../../ui/Card';

// Simple Markdown to HTML converter
// Handles:
// - Bold: **text** or __text__
// - Italics: *text* or _text_
// - Newlines: \n
const simpleMarkdownToHtml = (text) => {
  if (typeof text !== 'string' || !text) return { __html: '' };
  let html = text;

  // Escape basic HTML characters to prevent unintended HTML injection if any exist in the source text
  // This is a minimal escape, for more complex scenarios a proper sanitizer is needed.
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');

  // Bold: **text** or __text__
  // The lookaheads and lookbehinds ensure we don't match things like a***b***c or a___b___c
  html = html.replace(/(?<!\*)\*\*(?!\*)(.+?)(?<!\*)\*\*(?!\*)|(?<!_)_{2}(?!_)(.+?)(?<!_)_{2}(?!_)/g, '<strong>$1$2</strong>');
  // Italics: *text* or _text_ (ensure not part of a bold)
  html = html.replace(/(?<!\*)\*(?!\*|_)(.+?)(?<!\*|_)\*(?!\*)|(?<!_)(?<!\*\*)_(?!_|\*\*)\b(.+?)\b(?<!_|\*\*)\_(?!_|\*\*)/g, '<em>$1$2</em>');
  // Newlines to <br />
  html = html.replace(/\n/g, '<br />');

  return { __html: html };
};


export const InsightsList = ({ insights }) => {
  const [openItemIds, setOpenItemIds] = useState([]);

  useEffect(() => {
    if (insights && insights.length > 0) {
      setOpenItemIds(insights.map(insight => `item-${insight.id}`));
    } else {
      setOpenItemIds([]);
    }
  }, [insights]);

  const toggleItem = (id) => {
    setOpenItemIds(prevOpenItemIds =>
      prevOpenItemIds.includes(id)
        ? prevOpenItemIds.filter(itemId => itemId !== id)
        : [...prevOpenItemIds, id]
    );
  };

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No insights available at the moment. Check back later or try regenerating!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion>
        {insights.map((insight) => {
          const itemId = `item-${insight.id}`;
          const isOpen = openItemIds.includes(itemId);

            return (
            <AccordionItem
              key={insight.id}
              value={itemId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <AccordionTrigger
              onClick={() => toggleItem(itemId)}
              isOpen={isOpen}
              className="p-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full"
              >
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {insight.title}
              </span>
              </AccordionTrigger>

              <AccordionContent isOpen={isOpen} className="px-4">
              {/* Container for Explanation */}
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <strong className="font-medium text-gray-800 dark:text-gray-200 block mb-1">
                Explanation:
                </strong>
                <div
                className="text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={simpleMarkdownToHtml(insight.explanation)}
                />
              </div>

              {/* Container for Calculated Impact */}
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                <strong className="font-medium text-gray-800 dark:text-gray-200 block mb-1">
                Implications:
                </strong>
                <div
                className="text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
                dangerouslySetInnerHTML={simpleMarkdownToHtml(insight.impact)}
                />
              </div>

              {/* Container for Actionable Next Steps */}
              <div>
                <strong className="font-medium text-gray-800 dark:text-gray-200 block mb-1">
                Recommended Actions:
                </strong>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {insight.nextSteps && insight.nextSteps.length > 0 ? (
                  insight.nextSteps.map((step, index) => (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={simpleMarkdownToHtml(step)}
                    className="prose dark:prose-invert max-w-none"
                  />
                  ))
                ) : (
                  <div>No specific next steps provided.</div>
                )}
                </div>
              </div>
              </AccordionContent>
            </AccordionItem>
            );
        })}
      </Accordion>
    </div>
  );
};

export default InsightsList;
