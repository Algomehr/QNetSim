import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AnalysisResult, AnalysisStatus, AnalysisMode } from '../types';
import { AnalysisDetails } from './AnalysisDetails';
import { RunIcon, ChevronDownIcon } from './icons/UIIcons';

interface AnalysisPanelProps {
  onAnalyze: (mode: AnalysisMode) => void;
  analysisStatus: AnalysisStatus;
  analysisResult: AnalysisResult | null;
}

const analysisOptions: { id: AnalysisMode; label: string; description: string }[] = [
    { id: 'comprehensive', label: 'تحلیل جامع', description: 'گزارش کامل شامل همه جوانب.' },
    { id: 'security', label: 'تحلیل امنیتی', description: 'تمرکز بر QBER، شنود و امنیت پروتکل.' },
    { id: 'performance', label: 'تحلیل عملکرد شبکه', description: 'تمرکز بر وفاداری، نرخ کلید و تاخیر.' },
    { id: 'state', label: 'تحلیل حالت کوانتومی', description: 'بررسی عمیق بردار حالت و ماتریس چگالی.' },
    { id: 'errorBudget', label: 'تحلیل بودجه خطا', description: 'شناسایی منابع اصلی خطا و ارائه پیشنهادات بهینه‌سازی.' },
    { id: 'educational', label: 'حالت آموزشی', description: 'توضیحات ساده‌شده در مورد مبانی تئوری و کاربردهای عملی.' },
];

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  onAnalyze,
  analysisStatus,
  analysisResult,
}) => {
  const [height, setHeight] = useState(384);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('comprehensive');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoading = analysisStatus === 'loading';
  const currentOption = analysisOptions.find(opt => opt.id === selectedMode);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (mode: AnalysisMode) => {
    setSelectedMode(mode);
    setIsDropdownOpen(false);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newHeight = window.innerHeight - e.clientY;
    const maxHeight = window.innerHeight * 0.9;
    const minHeight = 120;
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setHeight(newHeight);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, handleMouseUp]);

  const renderContent = () => {
    switch (analysisStatus) {
      case 'idle':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">یک حالت تحلیل انتخاب کرده و آن را برای مشاهده گزارش اجرا کنید.</p>
          </div>
        );
      case 'loading':
         const currentModeLabel = analysisOptions.find(opt => opt.id === selectedMode)?.label || 'تحلیل';
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="animate-spin h-8 w-8 text-cyan-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                <p className="text-cyan-300 animate-pulse">در حال انجام «{currentModeLabel}» با Gemini...</p>
                <p className="text-xs text-gray-400 mt-1">این فرآیند ممکن است کمی طول بکشد.</p>
            </div>
         );
      case 'error':
         return (
            <div className="flex items-center justify-center h-full">
               <p className="text-sm text-red-400">خطا در تحلیل مدار. لطفاً دوباره تلاش کنید.</p>
            </div>
         );
      case 'success':
        return analysisResult ? <AnalysisDetails result={analysisResult} /> : null;
      default:
        return null;
    }
  };

  return (
    <footer
      style={{ height: `${height}px` }}
      className="bg-gray-900/60 backdrop-blur-xl border-t-2 border-white/10 flex flex-col flex-shrink-0 relative h-full md:h-auto"
    >
      <div
        onMouseDown={handleMouseDown}
        className="w-full h-4 absolute -top-2 left-0 cursor-row-resize z-10 hidden md:flex items-center justify-center group"
        aria-label="Resize analysis panel"
        role="separator"
      >
        <div className="w-16 h-1.5 bg-gray-600 rounded-full group-hover:bg-cyan-400 transition-colors" />
      </div>

      <div className="p-4 flex flex-col flex-grow min-h-0">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-cyan-400">تحلیل و شبیه‌سازی</h2>
          
          <div className="relative" ref={dropdownRef}>
            <div id="analysis-button-group" className="flex rounded-md shadow-sm">
              <button
                id={`analysis-run-button-${selectedMode}`}
                onClick={() => onAnalyze(selectedMode)}
                disabled={isLoading}
                className="relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-2 px-4 rounded-r-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed min-w-[150px]"
              >
                {isLoading ? '...' : <RunIcon />}
                {isLoading ? 'در حال اجرا' : `اجرای ${currentOption?.label || ''}`}
              </button>
              <div className="relative -ml-px block">
                <button
                  type="button"
                  id="analysis-mode-dropdown-button"
                  className="relative inline-flex items-center bg-green-600/80 p-2 rounded-l-md border-r border-green-400/50 text-white hover:bg-green-500 focus:z-10 disabled:bg-gray-700"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}
                >
                  <span className="sr-only">Open options</span>
                  <ChevronDownIcon />
                </button>
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-72 origin-bottom-right rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {analysisOptions.map(option => (
                    <a
                      href="#"
                      key={option.id}
                      id={`analysis-mode-option-${option.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleModeSelect(option.id);
                      }}
                      className={`block px-4 py-2 text-sm text-right transition-colors ${selectedMode === option.id ? 'bg-teal-500/20 text-teal-200' : 'text-gray-300 hover:bg-white/10'}`}
                      role="menuitem"
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-1 min-h-0">
          {renderContent()}
        </div>
      </div>
    </footer>
  );
};