// import React from 'react';
// import { mockInsights } from '../data/mockData';
// import { InsightsList } from '../components/features/insights/InsightsList';

// export const InsightsPage = () => {
//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
//         Insights & Recommendations
//       </h1>
//       <InsightsList insights={mockInsights} />
//     </div>
//   );
// };

import React from 'react';
import { mockInsights } from '../data/mockData';
import InsightsList from '../components/features/insights/InsightsList';

export const InsightsPage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Insights & Recommendations
      </h1>
      <InsightsList insights={mockInsights} />
    </div>
  );
};