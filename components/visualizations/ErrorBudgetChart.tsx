import React from 'react';
import { ErrorContribution } from '../../types';

interface ErrorBudgetChartProps {
  data: ErrorContribution[];
}

export const ErrorBudgetChart: React.FC<ErrorBudgetChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-500">داده‌ای برای تحلیل بودجه خطا یافت نشد.</p>;
  }

  const totalContribution = data.reduce((sum, item) => sum + item.contribution, 0);
  const normalizedData = data.map(item => ({
    ...item,
    percentage: (item.contribution / totalContribution) * 100,
  }));

  const maxPercentage = Math.max(...normalizedData.map(item => item.percentage), 1);

  return (
    <div className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700">
      <div className="flex flex-col space-y-2">
        {normalizedData
          .sort((a, b) => b.percentage - a.percentage) // Sort descending
          .map((item, index) => (
            <div key={index} className="flex items-center space-x-2 space-x-reverse">
              <div className="w-24 text-right text-xs text-gray-400 truncate" title={item.source}>
                {item.source}
              </div>
              <div className="flex-grow bg-gray-700 rounded-full h-4 relative overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${item.percentage}%` }}
                ></div>
                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-white/90">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-48 text-left text-xs text-gray-500 hidden sm:block truncate" title={item.description}>
                {item.description}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};