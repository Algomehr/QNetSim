import React from 'react';

interface ShotData {
  state: string;
  count: number;
}

interface ShotDistributionChartProps {
  data: ShotData[];
}

export const ShotDistributionChart: React.FC<ShotDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-500">داده‌ای برای نمایش نمودار وجود ندارد.</p>;
  }

  const totalShots = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(item => item.count), 1);

  return (
    <div className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700">
      <div className="flex justify-around items-end h-32 space-x-2 space-x-reverse">
        {data.map(({ state, count }) => (
          <div key={state} className="flex flex-col items-center flex-1">
            <div className="text-cyan-300 text-sm font-semibold mb-1">
                {count}
            </div>
            <div
              className="w-full bg-cyan-600 rounded-t-sm hover:bg-cyan-500 transition-all duration-300"
              style={{ height: `${(count / maxCount) * 100}%` }}
              title={`State: |${state}⟩, Counts: ${count} (${((count / totalShots) * 100).toFixed(1)}%)`}
            ></div>
            <div className="mt-2 text-xs font-mono text-gray-400">|{state}⟩</div>
          </div>
        ))}
      </div>
       <p className="text-center text-xs text-gray-500 mt-2">مجموع تکرارها: {totalShots}</p>
    </div>
  );
};
