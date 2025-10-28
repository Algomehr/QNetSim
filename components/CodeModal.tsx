import React from 'react';
import { CloseIcon } from './icons/UIIcons';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-900/80 border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold text-cyan-300">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </header>
        <main className="p-4 flex-grow overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
