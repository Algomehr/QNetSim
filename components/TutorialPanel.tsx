import React from 'react';
import { Tutorial } from '../types';
import { CloseIcon } from './icons/UIIcons';

interface TutorialPanelProps {
  tutorial: Tutorial;
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  isError: boolean;
}

export const TutorialPanel: React.FC<TutorialPanelProps> = ({ tutorial, currentStepIndex, onNext, onPrev, onExit, isError }) => {
  const step = tutorial.steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  return (
    <div className={`absolute bottom-4 right-4 md:bottom-auto md:top-4 md:right-4 w-80 bg-gray-900/70 backdrop-blur-lg border border-sky-400/50 rounded-xl shadow-2xl shadow-sky-500/20 z-40 p-5 text-white animate-fade-in ${isError ? 'shake-error' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-sky-300">{tutorial.name}</h3>
          <p className="text-xs text-gray-400">قدم {currentStepIndex + 1} از {tutorial.steps.length}</p>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{step.content}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-4">
        <div className="bg-sky-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 text-sm font-semibold text-gray-300 bg-white/5 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          قبلی
        </button>
        {step.action === 'read' && (
           <button
            onClick={onNext}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 rounded-md hover:opacity-90 transition-opacity"
           >
            {currentStepIndex === tutorial.steps.length - 1 ? 'پایان' : 'بعدی'}
           </button>
        )}
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shake-error {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          border-color: #f87171; /* red-400 */
        }
      `}</style>
    </div>
  );
};