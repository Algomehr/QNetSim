import React from 'react';
import { MeasurementProbability } from '../../types';

interface ProbabilityChartProps {
  data: MeasurementProbability[];
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-500">داده‌ای برای نمایش نمودار وجود ندارد.</p>;
  }

  return (
    <div className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700">
      <div className="flex justify-around items-end h-32 space-x-2 space-x-reverse">
        {data.map(({ state, probability }) => (
          <div key={state} className="flex flex-col items-center flex-1">
            <div className="text-cyan-300 text-sm font-semibold mb-1">
                {(probability * 100).toFixed(1)}%
            </div>
            <div
              className="w-full bg-cyan-600 rounded-t-sm hover:bg-cyan-500 transition-all duration-300"
              style={{ height: `${probability * 100}%` }}
              title={`State: |${state}⟩, Probability: ${(probability * 100).toFixed(1)}%`}
            ></div>
            <div className="mt-2 text-xs font-mono text-gray-400">|{state}⟩</div>
          </div>
        ))}
      </div>
    </div>
  );
};
