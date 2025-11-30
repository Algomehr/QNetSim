import React, { useMemo, useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { AnalysisResult, NodeData, ProtocolTraceEvent } from '../types';

interface StateVectorInspectorProps {
    selectedNode: Node<NodeData> | null;
    simulationResult: AnalysisResult | null;
}

interface Step {
    nodeId: string;
    nodeLabel: string;
    stateVector: string;
}

interface ParsedState {
    amplitude: number;
    phase: number; // in radians
    basis: string;
}

// A simple parser for complex numbers in "a+bi" or "a-bi" format
const parseComplex = (s: string): { real: number; imag: number } => {
    s = s.trim();
    const match = s.match(/([+-]?\d+\.?\d*)\s*([+-])\s*(\d*\.?\d*)i/);
    if (match) {
        return { real: parseFloat(match[1]), imag: parseFloat(match[2] + (match[3] || '1')) };
    }
    if (s.endsWith('i')) {
        const imagPart = s.replace('i', '');
        return { real: 0, imag: parseFloat(imagPart === '+' ? '1' : imagPart === '-' ? '-1' : imagPart || '1') };
    }
    return { real: parseFloat(s), imag: 0 };
};


const parseStateVector = (vector: string): ParsedState[] => {
    if (!vector) return [];
    
    // Split by basis ket to isolate terms
    const terms = vector.split(/(?=[+-]\s*\d*\.?\d*\|\d+⟩)|(?=[+-]\s*\|\d+⟩)/g) // Split by new complex number/sign + |basis>
                  .map(term => term.trim())
                  .filter(Boolean);
    
    return terms.map(term => {
        const parts = term.split('|');
        if (parts.length < 2) return null;

        let amplitudeStr = parts[0].trim();
        const basis = `|${parts[1]}`;

        if (amplitudeStr === '' || amplitudeStr === '+') amplitudeStr = '1';
        if (amplitudeStr === '-') amplitudeStr = '-1';

        const { real, imag } = parseComplex(amplitudeStr);
        
        const amplitude = Math.sqrt(real * real + imag * imag);
        const phase = Math.atan2(imag, real);
        
        return { amplitude, phase, basis };
    }).filter((item): item is ParsedState => item !== null && item.amplitude > 0.0001);
};


const PhaseWheel: React.FC<{ phase: number, size: number }> = ({ phase, size }) => {
    const r = size / 2;
    const x2 = r + r * 0.8 * Math.cos(phase);
    const y2 = r + r * 0.8 * Math.sin(phase);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={r} cy={r} r={r-1} fill="none" stroke="#6b7280" strokeWidth="1" />
            <line x1={r} y1={r} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

export const StateVectorInspector: React.FC<StateVectorInspectorProps> = ({ selectedNode, simulationResult }) => {
    const [currentTraceIndex, setCurrentTraceIndex] = useState(0);

    // Reset index when a new simulation result comes in or when no result
    useEffect(() => {
        setCurrentTraceIndex(0);
    }, [simulationResult]);

    const protocolTrace = simulationResult?.protocolTrace || simulationResult?.stepByStepExplanation;
    const hasTimeline = protocolTrace && protocolTrace.length > 0;

    const displayedTraceEvent: ProtocolTraceEvent | null = useMemo(() => {
        if (!hasTimeline) return null;
        return protocolTrace[currentTraceIndex];
    }, [hasTimeline, protocolTrace, currentTraceIndex]);

    const displayedStateVector = useMemo(() => {
        if (displayedTraceEvent?.state) {
            return displayedTraceEvent.state;
        }
        // Fallback for when trace event doesn't have state, but a node is selected
        if (!hasTimeline && selectedNode) {
            const step = simulationResult?.stepByStepExplanation?.find(s => s.nodeId === selectedNode.id);
            if (step) return step.stateVectorAfter;
            if (selectedNode.type === 'measure' && simulationResult?.finalStateVector) return simulationResult.finalStateVector;
        }
        return '';
    }, [displayedTraceEvent, hasTimeline, selectedNode, simulationResult]);


    const parsedStates = useMemo(() => parseStateVector(displayedStateVector || ''), [displayedStateVector]);

    const renderContent = () => {
        if (!simulationResult) {
            return <p className="text-xs text-gray-500">برای مشاهده وضعیت سیستم، ابتدا تحلیل را اجرا کنید.</p>;
        }
        
        if (hasTimeline && displayedTraceEvent) {
             return (
                <div className="w-full">
                    <p className="text-sm font-semibold text-gray-200 mb-2">
                        وضعیت سیستم در رویداد {currentTraceIndex + 1}: <span className="text-cyan-300">{displayedTraceEvent.event}</span>
                        <span className="text-xs text-gray-400 font-normal mr-2"> @ گره: {displayedTraceEvent.nodeLabel}</span>
                    </p>
                    <p className="text-xs text-gray-300 mb-2">{displayedTraceEvent.description}</p>
                    {parsedStates.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {parsedStates.map(({ amplitude, phase, basis }, index) => {
                                const probability = amplitude * amplitude;
                                return (
                                    <div key={index} className="flex items-center space-x-2 space-x-reverse bg-black/20 p-2 rounded-lg">
                                        <PhaseWheel phase={phase} size={20} />
                                        <div className="flex flex-col text-right">
                                            <span dir="ltr" className="font-mono text-cyan-300 text-sm">{basis}</span>
                                            <span className="text-xs text-gray-400">
                                            دامنه: {amplitude.toFixed(3)}
                                            </span>
                                        </div>
                                        <div className="w-24 h-5 bg-gray-700 rounded-full overflow-hidden ml-2">
                                            <div 
                                                className="h-full bg-cyan-500 transition-all duration-300"
                                                style={{ width: `${probability * 100}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-300 w-12 text-left">
                                            {(probability * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                         <p className="text-xs text-gray-500">بردار حالتی برای این گام یافت نشد یا وضعیت تغییرات حالت کوانتومی ندارد.</p>
                    )}
                </div>
            );
        }

        if (selectedNode) {
            return <p className="text-xs text-gray-400">یک قطعه را برای بازرسی بردار حالت آن انتخاب کنید.</p>;
        }
         return <p className="text-xs text-gray-500">داده‌ای برای این مرحله یافت نشد.</p>;
    }
    
    return (
        <div className="h-auto flex-shrink-0 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 p-3 flex flex-col items-center justify-center">
            {renderContent()}
            {hasTimeline && (
                <div className="w-full mt-3">
                    <label htmlFor="timeline-slider" className="block text-xs font-medium text-gray-400 mb-1">
                        نمای خط زمانی: گام {currentTraceIndex + 1} از {protocolTrace!.length}
                    </label>
                    <input
                        id="timeline-slider"
                        type="range"
                        min="0"
                        max={(protocolTrace?.length || 1) - 1}
                        step="1"
                        value={currentTraceIndex}
                        onChange={(e) => setCurrentTraceIndex(parseInt(e.target.value, 10))}
                        className="w-full"
                    />
                </div>
            )}
        </div>
    )
}