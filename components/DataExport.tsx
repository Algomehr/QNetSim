import React from 'react';
import { AnalysisResult } from '../types';

interface DataExportProps {
  result: AnalysisResult;
}

export const DataExport: React.FC<DataExportProps> = ({ result }) => {

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportFullJson = () => {
    const jsonString = JSON.stringify(result, null, 2);
    downloadFile(jsonString, 'quantum_analysis_report.json', 'application/json');
  };

  const convertToCsv = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = data.map(item => headers.map(header => item[header]).join(','));
    return [headerRow, ...rows].join('\n');
  };

  const exportProbabilitiesCsv = () => {
    if (!result.measurementProbabilities) return;
    const headers = ['state', 'probability'];
    const csvString = convertToCsv(result.measurementProbabilities, headers);
    downloadFile(csvString, 'measurement_probabilities.csv', 'text/csv');
  };

  const exportCountsCsv = () => {
    if (!result.measurementCounts) return;
    const headers = ['state', 'count'];
    const csvString = convertToCsv(result.measurementCounts, headers);
    downloadFile(csvString, 'measurement_counts.csv', 'text/csv');
  };


  return (
    <div className="space-y-3">
        <h4 className="font-semibold text-gray-200 mb-2">خروجی داده‌ها</h4>
        <p className="text-xs text-gray-400 mb-3">نتایج شبیه‌سازی را برای تحلیل بیشتر در نرم‌افزارهای دیگر ذخیره کنید.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
                onClick={exportFullJson}
                className="w-full text-center p-3 bg-indigo-600/20 border border-indigo-500/50 rounded-lg transition-all duration-200 hover:bg-indigo-500/30 hover:border-indigo-400"
            >
                <p className="font-semibold text-indigo-300">دانلود گزارش کامل (JSON)</p>
            </button>
            <button
                onClick={exportProbabilitiesCsv}
                className="w-full text-center p-3 bg-cyan-600/20 border border-cyan-500/50 rounded-lg transition-all duration-200 hover:bg-cyan-500/30 hover:border-cyan-400"
            >
                <p className="font-semibold text-cyan-300">دانلود احتمالات (CSV)</p>
            </button>
             {result.measurementCounts && result.measurementCounts.length > 0 && (
                 <button
                    onClick={exportCountsCsv}
                    className="w-full text-center p-3 bg-cyan-600/20 border border-cyan-500/50 rounded-lg transition-all duration-200 hover:bg-cyan-500/30 hover:border-cyan-400"
                >
                    <p className="font-semibold text-cyan-300">دانلود شمارش‌ها (CSV)</p>
                </button>
            )}
        </div>
    </div>
  );
};