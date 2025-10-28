import React, { useMemo } from 'react';
import { Node } from 'reactflow';
import { AnalysisResult, NodeData } from '../types';

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
        return { real: 0, imag: parseFloat(s.replace('i', '') || '1') };
    }
    return { real: parseFloat(s), imag: 0 };
};


const parseStateVector = (vector: string): ParsedState[] => {
    if (!vector) return [];
    
    return vector.split(/(?=[+-])/).map(term => term.trim()).filter(Boolean).map(term => {
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
    
    const currentStep: Step | null = useMemo(() => {
        if (!simulationResult || !selectedNode) return null;
        
        const step = simulationResult.stepByStepExplanation?.find(s => s.nodeId === selectedNode.id);
        
        if (step) {
            return {
                nodeId: step.nodeId,
                nodeLabel: step.gateName,
                stateVector: step.stateVectorAfter
            };
        }

        // If no direct step, check if it's a measurement node which represents the final state.
        if (selectedNode.type === 'measure' && simulationResult.finalStateVector) {
            return {
                nodeId: selectedNode.id,
                nodeLabel: 'وضعیت نهایی',
                stateVector: simulationResult.finalStateVector
            }
        }

        return null;

    }, [selectedNode, simulationResult]);

    const parsedStates = useMemo(() => parseStateVector(currentStep?.stateVector || ''), [currentStep]);

    const renderContent = () => {
        if (!simulationResult) {
            return <p className="text-xs text-gray-500">برای مشاهده وضعیت سیستم، ابتدا تحلیل را اجرا کنید.</p>;
        }
        if (!selectedNode) {
            return <p className="text-xs text-gray-400">یک قطعه را برای بازرسی بردار حالت آن انتخاب کنید.</p>;
        }
         if (!currentStep) {
            return <p className="text-xs text-gray-500">داده‌ای برای این مرحله یافت نشد. ممکن است این قطعه در مسیر اصلی مدار نباشد.</p>;
        }

        return (
            <div className="w-full">
                <p className="text-sm font-semibold text-gray-200 mb-2">
                    وضعیت سیستم پس از: <span className="text-cyan-300">{currentStep.nodeLabel}</span>
                </p>
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
            </div>
        );
    }
    
    return (
        <div className="h-28 flex-shrink-0 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 p-3 flex items-center justify-center">
            {renderContent()}
        </div>
    )
}