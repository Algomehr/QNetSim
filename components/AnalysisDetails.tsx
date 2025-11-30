import React, { useState } from 'react';
import { AnalysisResult, ErrorContribution, SweepResult } from '../types';
import { ProbabilityChart } from './visualizations/ProbabilityChart';
import { DensityMatrixViewer } from './visualizations/DensityMatrixViewer';
import { ShotDistributionChart } from './visualizations/ShotDistributionChart';
import { HintonDiagram } from './visualizations/HintonDiagram';
import { DataExport } from './DataExport';
import { ProtocolSecurityPanel } from './ProtocolSecurityPanel';
import { ErrorBudgetChart } from './visualizations/ErrorBudgetChart'; // New import
import { ParameterSweepChart } from './visualizations/ParameterSweepChart'; // New import

interface AnalysisReportProps {
  result: AnalysisResult;
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void }> = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 relative whitespace-nowrap ${
      isActive
        ? 'text-cyan-300'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {title}
    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"></div>}
  </button>
);

export const AnalysisDetails: React.FC<AnalysisReportProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const hasAdvancedResults = result.errorSourceAnalysis && (typeof result.errorSourceAnalysis !== 'string' || result.errorSourceAnalysis.length > 0) && result.optimizationSuggestions;
  const hasProtocolResults = result.protocolAnalysis;
  const hasSweepResults = result.sweepResults && result.sweepResults.length > 0;
  const hasWignerQFunction = result.wignerQFunctionDescription && result.wignerQFunctionDescription.length > 0;


  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold text-base text-white mb-1">{result.title}</h3>
              <p className="text-cyan-200">{result.objective}</p>
            </div>
             {result.networkPerformance && (
                <div className="border-t border-white/10 pt-3">
                    <h4 className="font-semibold text-gray-200 mb-2">خلاصه عملکرد شبکه</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        {result.networkPerformance.endToEndFidelity != null && (
                            <div className="bg-black/20 p-2 rounded-lg">
                                <p className="text-xs text-gray-400">وفاداری نهایی</p>
                                <p className="text-lg font-bold text-cyan-300">{(result.networkPerformance.endToEndFidelity * 100).toFixed(2)}%</p>
                            </div>
                        )}
                        {result.networkPerformance.successProbability != null && (
                            <div className="bg-black/20 p-2 rounded-lg">
                                <p className="text-xs text-gray-400">احتمال موفقیت</p>
                                <p className="text-lg font-bold text-cyan-300">{(result.networkPerformance.successProbability * 100).toFixed(2)}%</p>
                            </div>
                        )}
                        {result.networkPerformance.keyRate != null && (
                             <div className="bg-black/20 p-2 rounded-lg">
                                <p className="text-xs text-gray-400">نرخ کلید (bps)</p>
                                <p className="text-lg font-bold text-cyan-300">{result.networkPerformance.keyRate.toFixed(2)}</p>
                            </div>
                        )}
                        {result.networkPerformance.latency != null && (
                             <div className="bg-black/20 p-2 rounded-lg">
                                <p className="text-xs text-gray-400">تاخیر (ms)</p>
                                <p className="text-lg font-bold text-cyan-300">{result.networkPerformance.latency.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="border-t border-white/10 pt-3">
              <h4 className="font-semibold text-gray-200 mb-2">پس‌زمینه تئوری</h4>
              <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">{result.theoreticalBackground}</p>
            </div>
          </div>
        );
      case 'trace':
        const trace = result.protocolTrace || result.stepByStepExplanation; // Fallback for older format
        const isTrace = !!result.protocolTrace;
        return (
            <div className="space-y-3">
                {trace?.map((step, index) => (
                    <div key={index} className="p-3 bg-black/20 rounded-lg border border-white/10">
                        <p className="font-semibold text-cyan-300 mb-1">
                            {isTrace ? `رویداد ${index + 1}: ${(step as any).event}` : `گام ${index + 1}: ${step.gateName}`}
                            {isTrace && <span className="text-xs text-gray-400 font-normal"> @ گره: {(step as any).nodeLabel}</span>}
                        </p>
                        <p className="text-xs text-gray-300 mb-2">{step.description}</p>
                         <p dir="ltr" className="text-center font-mono text-indigo-300 bg-black/30 p-2 rounded-md text-xs tracking-wider">
                            {isTrace ? (step as any).state || 'N/A' : step.stateVectorAfter}
                        </p>
                    </div>
                ))}
            </div>
        );
      case 'results':
        return (
             <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">تحلیل نتایج</h4>
                    <p className="leading-relaxed text-gray-300 whitespace-pre-wrap text-sm">{result.resultsAnalysis}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-3">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2 text-center">نتایج ایده‌آل (تئوری)</h4>
                        <ProbabilityChart data={result.measurementProbabilities} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2 text-center">نتایج شبیه‌سازی (با نویز)</h4>
                        {result.measurementCounts && result.measurementCounts.length > 0 ? (
                           <ShotDistributionChart data={result.measurementCounts} />
                        ) : (
                           <p className="text-xs text-gray-500 text-center mt-8">شبیه‌سازی نویزی اجرا نشده است.</p>
                        )}
                    </div>
                </div>
                
                {result.densityMatrix && ( // Show Hinton Diagram if density matrix exists
                    <div className="border-t border-white/10 pt-3">
                        <h4 className="font-semibold text-gray-200 mb-2">نمودار هینتون ماتریس چگالی (بخش حقیقی)</h4>
                        <HintonDiagram matrixString={result.densityMatrix} />
                    </div>
                )}

                {hasWignerQFunction && (
                  <div className="border-t border-white/10 pt-3">
                    <h4 className="font-semibold text-gray-200 mb-2">توصیف تابع ویگنر/Q (Wigner/Q-function)</h4>
                    <p className="leading-relaxed text-gray-300 whitespace-pre-wrap text-sm">{result.wignerQFunctionDescription}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        (تجسم گرافیکی پیشرفته این توابع نیاز به ابزارهای تخصصی دارد.)
                    </p>
                  </div>
                )}
             </div>
        );
      case 'data': // New data and export tab
        return (
            <div className="space-y-6">
                <DataExport result={result} />
                <div className="border-t border-white/10 pt-4">
                    {result.densityMatrix ? (
                        <div>
                            <h4 className="font-semibold text-gray-200 mb-2">ماتریس چگالی نهایی (ρ)</h4>
                            <DensityMatrixViewer matrixString={result.densityMatrix} />
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-semibold text-gray-200 mb-2">بردار حالت نهایی سیستم |ψ⟩</h4>
                             <p dir="ltr" className="text-center font-mono text-cyan-300 bg-black/30 p-2 rounded-md text-sm tracking-wider">
                                {result.finalStateVector}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
      case 'lab':
        return (
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">آنالوژی ستاپ آزمایشگاهی</h4>
              <p className="leading-relaxed text-gray-300 whitespace-pre-wrap text-sm">{result.experimentalSetupAnalogy}</p>
            </div>
        );
      case 'applications':
        return (
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">کاربردهای بالقوه و مراحل بعدی</h4>
              <p className="leading-relaxed text-gray-300 whitespace-pre-wrap text-sm">{result.potentialApplications}</p>
            </div>
        );
      case 'security':
        return result.protocolAnalysis ? <ProtocolSecurityPanel analysis={result.protocolAnalysis} /> : null;
      case 'advanced':
        const errorAnalysisData = typeof result.errorSourceAnalysis !== 'string' 
          ? result.errorSourceAnalysis 
          : (result.errorSourceAnalysis ? [{ source: 'General Errors', contribution: 100, description: result.errorSourceAnalysis }] : []);
        
        return (
            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">تحلیل منابع خطا</h4>
                    {errorAnalysisData && errorAnalysisData.length > 0 ? (
                        <ErrorBudgetChart data={errorAnalysisData as ErrorContribution[]} />
                    ) : (
                        <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">{result.errorSourceAnalysis}</p>
                    )}
                </div>
                <div className="border-t border-white/10 pt-3">
                    <h4 className="font-semibold text-gray-200 mb-2">پیشنهادات بهینه‌سازی</h4>
                    <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">{result.optimizationSuggestions}</p>
                </div>
            </div>
        );
      case 'sweep': // New tab for parameter sweep results
        return hasSweepResults ? (
          <div className="space-y-4 text-sm">
            <h4 className="font-semibold text-gray-200 mb-2">نتایج پیمایش پارامتر</h4>
            {result.sweepResults?.map((sweep, index) => (
              <div key={index} className="bg-black/20 p-3 rounded-lg border border-white/10">
                <h5 className="font-bold text-cyan-300 mb-2">پارامتر پیمایش شده: {sweep.parameter} {sweep.unit ? `(${sweep.unit})` : ''}</h5>
                <ParameterSweepChart data={sweep} />
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-2">
              (نمودارهای تعاملی پیشرفته در اینجا قابل ادغام هستند.)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">نتیجه‌ای از پیمایش پارامتر یافت نشد.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="border-b border-white/10 mb-4">
        <nav className="flex space-x-2 space-x-reverse -mb-px overflow-x-auto">
          <TabButton title="خلاصه" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <TabButton title="ردیابی پروتکل" isActive={activeTab === 'trace'} onClick={() => setActiveTab('trace')} />
          <TabButton title="نتایج بصری" isActive={activeTab === 'results'} onClick={() => setActiveTab('results')} />
          <TabButton title="داده‌ها و خروجی" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
          <TabButton title="ستاپ آزمایشگاهی" isActive={activeTab === 'lab'} onClick={() => setActiveTab('lab')} />
          {result.potentialApplications && <TabButton title="کاربردها" isActive={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />}
          {hasProtocolResults && <TabButton title="تحلیل امنیتی" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} />}
          {hasAdvancedResults && <TabButton title="تحلیل پیشرفته" isActive={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} />}
          {hasSweepResults && <TabButton title="پیمایش پارامتر" isActive={activeTab === 'sweep'} onClick={() => setActiveTab('sweep')} />}
        </nav>
      </div>
      <div className="p-1 sm:p-4">
        {renderContent()}
      </div>
    </div>
  );
};