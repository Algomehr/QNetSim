import React from 'react';
import { SweepResult, SweepResultEntry } from '../../types';

interface ParameterSweepChartProps {
  data: SweepResult;
}

export const ParameterSweepChart: React.FC<ParameterSweepChartProps> = ({ data }) => {
  if (!data || data.results.length === 0) {
    return <p className="text-xs text-gray-500">داده‌ای برای پیمایش پارامتر یافت نشد.</p>;
  }

  const { parameter, unit, results } = data;

  const renderValue = (val: number | undefined) => 
    val === undefined ? 'N/A' : (val > 1000 || val < 0.001 ? val.toExponential(2) : val.toFixed(3));


  return (
    <div className="overflow-x-auto p-2 bg-gray-900 rounded-lg border border-gray-700">
      <table className="w-full text-center text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-gray-600 text-cyan-300">{parameter} {unit ? `(${unit})` : ''}</th>
            {results[0]?.qber !== undefined && <th className="p-2 border border-gray-600 text-cyan-300">QBER (%)</th>}
            {results[0]?.fidelity !== undefined && <th className="p-2 border border-gray-600 text-cyan-300">وفاداری (%)</th>}
            {results[0]?.keyRate !== undefined && <th className="p-2 border border-gray-600 text-cyan-300">نرخ کلید (bps)</th>}
            {results[0]?.latency !== undefined && <th className="p-2 border border-gray-600 text-cyan-300">تاخیر (ms)</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((entry: SweepResultEntry, index: number) => (
            <tr key={index} className="hover:bg-black/20">
              <td className="p-2 border border-gray-600 text-gray-200">{renderValue(entry.value)}</td>
              {entry.qber !== undefined && <td className="p-2 border border-gray-600 text-red-300">{renderValue(entry.qber * 100)}</td>}
              {entry.fidelity !== undefined && <td className="p-2 border border-gray-600 text-green-300">{renderValue(entry.fidelity * 100)}</td>}
              {entry.keyRate !== undefined && <td className="p-2 border border-gray-600 text-yellow-300">{renderValue(entry.keyRate)}</td>}
              {entry.latency !== undefined && <td className="p-2 border border-gray-600 text-blue-300">{renderValue(entry.latency)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};