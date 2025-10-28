import React from 'react';
import { ProtocolAnalysis } from '../types';

interface ProtocolSecurityPanelProps {
  analysis: ProtocolAnalysis;
}

const KeyDisplay: React.FC<{ title: string; bases?: string; keyStr?: string; referenceKey?: string; }> = ({ title, bases, keyStr, referenceKey }) => {
    if (!bases || !keyStr) return null;
    const keyChars = keyStr.split('');
    const baseChars = bases.split('');

    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">{title}</h4>
            <div className="p-2 bg-black/30 rounded-lg font-mono text-sm tracking-widest overflow-x-auto whitespace-nowrap">
                <div className="text-gray-500" aria-label="Bases">
                    {baseChars.map((char, i) => (
                        <span key={i} className={keyChars[i] === '-' ? 'opacity-30' : ''}>{char}</span>
                    ))}
                </div>
                <div className="text-white" aria-label="Key">
                    {keyChars.map((char, i) => {
                        const isError = referenceKey && referenceKey[i] !== '-' && referenceKey[i] !== char && char !== '-';
                        return (
                            <span key={i} className={isError ? 'text-red-500 font-bold' : (char === '-' ? 'opacity-30' : 'text-cyan-300')}>{char}</span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


export const ProtocolSecurityPanel: React.FC<ProtocolSecurityPanelProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6 text-sm">
        <div>
            <h3 className="font-bold text-base text-white mb-1">تحلیل امنیتی پروتکل {analysis.protocolName}</h3>
            <div className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg">
                <span className="font-semibold text-gray-200">نرخ خطای بیت کوانتومی (QBER):</span>
                <span className={`text-2xl font-bold ${(analysis.qber > 0.1) ? 'text-red-400' : 'text-green-400'}`}>
                    {(analysis.qber * 100).toFixed(2)}%
                </span>
            </div>
        </div>
        <div className="border-t border-white/10 pt-4">
             <h4 className="font-semibold text-gray-200 mb-2">ارزیابی امنیتی</h4>
             <p className="leading-relaxed text-gray-300 whitespace-pre-wrap">{analysis.securityAssessment}</p>
        </div>
        <div className="border-t border-white/10 pt-4 space-y-4">
            <h4 className="font-semibold text-gray-200 mb-2">مقایسه کلیدها (۱۶ بیت نمونه)</h4>
            <KeyDisplay title="مبنا و کلید ارسالی آلیس" bases={analysis.keys.aliceSentBasis} keyStr={analysis.keys.aliceSiftedKey} />
            <KeyDisplay title="مبنا و کلید اندازه‌گیری شده باب" bases={analysis.keys.bobMeasureBasis} keyStr={analysis.keys.bobSiftedKey} referenceKey={analysis.keys.aliceSiftedKey} />
            {analysis.keys.eveEavesdropBasis && (
                 <KeyDisplay title="مبنا و کلید شنود شده توسط Eve" bases={analysis.keys.eveEavesdropBasis} keyStr={analysis.keys.eveSiftedKey} referenceKey={analysis.keys.aliceSiftedKey} />
            )}
        </div>
    </div>
  );
};