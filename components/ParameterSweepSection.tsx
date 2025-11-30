import React, { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { ParameterSweepSettings, SweepParameter, SweepTargetType, AnalysisMode, NodeData, EdgeData } from '../types';
import { RunIcon as PlayIcon } from './icons/UIIcons'; // Corrected: Imported RunIcon and aliased as PlayIcon

interface ParameterSweepSectionProps {
  nodes: Node[];
  edges: Edge[];
  onRunSweep: (sweepSettings: ParameterSweepSettings, mode: AnalysisMode) => void;
  isSweeping: boolean;
  isBusy: boolean; // General busy state (generating circuit or sweeping)
}

const commonNodeParameters: { id: keyof NodeData; label: string; unit: string; type: 'number' | 'range' }[] = [
  { id: 't1', label: 'زمان T1', unit: 'μs', type: 'number' },
  { id: 't2', label: 'زمان T2', unit: 'μs', type: 'number' },
  { id: 'amplitudeDampingRate', label: 'نرخ میرایی دامنه', unit: '', type: 'number' },
  { id: 'phaseDampingRate', label: 'نرخ میرایی فاز', unit: '', type: 'number' },
  { id: 'efficiency', label: 'کارایی آشکارساز', unit: '%', type: 'number' },
  { id: 'darkCounts', label: 'شمارش تاریک', unit: 'Hz', type: 'number' },
  { id: 'deadTime', label: 'زمان مرده آشکارساز', unit: 'ns', type: 'number' },
  { id: 'afterpulsingProbability', label: 'احتمال پس‌پالسی', unit: '', type: 'number' },
  { id: 'crosstalkProbability', label: 'احتمال کراس‌تاک', unit: '', type: 'number' },
  { id: 'purity', label: 'خلوص منبع فوتون', unit: '%', type: 'number' },
  { id: 'indistinguishability', label: 'تفکیک‌ناپذیری منبع', unit: '', type: 'number' },
  { id: 'spectralPurity', label: 'خلوص طیفی منبع', unit: '', type: 'number' },
  { id: 'repetitionRate', label: 'نرخ تکرار منبع', unit: 'MHz', type: 'number' },
  { id: 'swapFidelity', label: 'وفاداری تعویض تکرارگر', unit: '%', type: 'number' },
  { id: 'gateFidelity', label: 'وفاداری گیت', unit: '%', type: 'number' },
];

const commonEdgeParameters: { id: keyof EdgeData; label: string; unit: string; type: 'number' | 'range' }[] = [
  { id: 'length', label: 'طول کانال', unit: 'km', type: 'number' },
  { id: 'attenuation', label: 'تضعیف کانال', unit: 'dB/km', type: 'number' },
  { id: 'dispersion', label: 'دیسپرسیون کانال', unit: 'ps/(nm·km)', type: 'number' },
  { id: 'polarizationDependentLoss', label: 'PDL کانال', unit: 'dB', type: 'number' },
  { id: 'temperature', label: 'دمای کانال', unit: 'K', type: 'number' },
  { id: 'thermalNoiseSpectralDensity', label: 'چگالی نویز حرارتی', unit: 'W/Hz', type: 'number' },
  { id: 'channelDepolarizingRate', label: 'نرخ دپولاریزاسیون کانال', unit: '/km', type: 'number' },
  { id: 'channelDephasingRate', label: 'نرخ دفیزیگ کانال', unit: '/km', type: 'number' },
];

const analysisMetrics: { id: SweepParameter; label: string; unit: string; type: 'number' }[] = [
    { id: 'qber', label: 'QBER', unit: '%', type: 'number' },
    { id: 'fidelity', label: 'وفاداری', unit: '%', type: 'number' },
    { id: 'keyRate', label: 'نرخ کلید', unit: 'bps', type: 'number' },
    { id: 'latency', label: 'تاخیر', unit: 'ms', type: 'number' },
];


export const ParameterSweepSection: React.FC<ParameterSweepSectionProps> = ({ nodes, edges, onRunSweep, isSweeping, isBusy }) => {
  const [selectedParameter, setSelectedParameter] = useState<SweepParameter | ''>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedTargetType, setSelectedTargetType] = useState<SweepTargetType | null>(null);
  const [startValue, setStartValue] = useState<number>(0);
  const [endValue, setEndValue] = useState<number>(1);
  const [stepValue, setStepValue] = useState<number>(0.1);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('performance');

  const allComponents = useMemo(() => {
    const nodeOptions = nodes.map(node => ({
      id: node.id,
      label: `${node.data?.label || node.type} (${node.id})`,
      type: 'node',
      data: node.data
    }));
    const edgeOptions = edges.map(edge => ({
      id: edge.id,
      label: `کانال: ${edge.source} -> ${edge.target} (${edge.id})`,
      type: 'edge',
      data: edge.data
    }));
    return [...nodeOptions, ...edgeOptions];
  }, [nodes, edges]);

  const availableParameters = useMemo(() => {
    const params: { id: SweepParameter; label: string; unit: string; type: 'number' | 'range' }[] = [];
    
    if (selectedTargetType === 'node' && selectedTargetId) {
      const node = nodes.find(n => n.id === selectedTargetId);
      if (node) {
        for (const param of commonNodeParameters) {
          if (param.id in node.data!) {
            params.push(param);
          }
        }
      }
    } else if (selectedTargetType === 'edge' && selectedTargetId) {
      const edge = edges.find(e => e.id === selectedTargetId);
      if (edge) {
        for (const param of commonEdgeParameters) {
          if (param.id in edge.data!) {
            params.push(param);
          }
        }
      }
    } else if (!selectedTargetId && !selectedTargetType) { // Network-wide analysis metrics for QBER, Fidelity etc.
        return analysisMetrics;
    }
    return params;
  }, [selectedTargetId, selectedTargetType, nodes, edges]);

  useEffect(() => {
    if (selectedTargetId && selectedParameter) {
        let currentVal: number | undefined;
        if (selectedTargetType === 'node') {
            currentVal = nodes.find(n => n.id === selectedTargetId)?.data?.[selectedParameter as keyof NodeData] as number | undefined;
        } else if (selectedTargetType === 'edge') {
            currentVal = edges.find(e => e.id === selectedTargetId)?.data?.[selectedParameter as keyof EdgeData] as number | undefined;
        }
        
        if (typeof currentVal === 'number') {
            setStartValue(currentVal * 0.5); // Default range to be around current value
            setEndValue(currentVal * 1.5);
            setStepValue(currentVal * 0.1 || 0.1);
        } else if (availableParameters.length > 0) { // For analysis metrics
            setStartValue(0);
            setEndValue(1);
            setStepValue(0.1);
        }
    } else if (!selectedTargetId && !selectedTargetType && availableParameters.length > 0) { // For network-wide metrics like QBER
        setStartValue(0);
        setEndValue(1);
        setStepValue(0.1);
    }
  }, [selectedParameter, selectedTargetId, selectedTargetType, availableParameters, nodes, edges]);


  const handleRunClick = () => {
    if (!selectedParameter || !selectedTargetType && !selectedTargetId && !analysisMetrics.some(m => m.id === selectedParameter)) {
      alert("لطفاً یک پارامتر برای پیمایش انتخاب کنید.");
      return;
    }
    if (startValue >= endValue || stepValue <= 0) {
      alert("محدوده یا گام پیمایش نامعتبر است.");
      return;
    }

    const sweepSettings: ParameterSweepSettings = {
      parameter: selectedParameter,
      targetId: selectedTargetId,
      targetType: selectedTargetType,
      range: { start: startValue, end: endValue, step: stepValue },
    };
    onRunSweep(sweepSettings, analysisMode);
  };

  return (
    <details className="py-4 group">
      <summary className="font-semibold text-gray-200 text-base cursor-pointer list-none flex justify-between items-center">
        پیمایش پارامتر و بودجه خطا
        <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
      </summary>
      <div className="mt-4 space-y-4 transition-opacity">
        <h4 className="font-semibold text-gray-300 text-sm mb-2">تنظیمات پیمایش</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">کامپوننت هدف</label>
          <select 
            value={selectedTargetId || ''} 
            onChange={(e) => {
              const id = e.target.value;
              setSelectedTargetId(id || null);
              setSelectedParameter('');
              if (id) {
                const component = allComponents.find(c => c.id === id);
                if (component) {
                  setSelectedTargetType(component.type as SweepTargetType);
                }
              } else {
                setSelectedTargetType(null);
              }
            }}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            disabled={isBusy}
          >
            <option value="">(شبکه کلی یا بدون انتخاب)</option>
            {allComponents.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            برای پیمایش یک پارامتر خاص یک گره/کانال را انتخاب کنید.
            اگر خالی باشد، می‌توانید معیارهای کلی شبکه را پیمایش کنید.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">پارامتر برای پیمایش</label>
          <select 
            value={selectedParameter} 
            onChange={(e) => setSelectedParameter(e.target.value as SweepParameter)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            disabled={isBusy || (selectedTargetId && availableParameters.length === 0)}
          >
            <option value="">انتخاب پارامتر</option>
            {availableParameters.map(param => (
              <option key={param.id} value={param.id}>
                {param.label} {param.unit ? `(${param.unit})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">شروع</label>
            <input 
              type="number" step="any" value={startValue} 
              onChange={(e) => setStartValue(parseFloat(e.target.value))} 
              className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm"
              disabled={isBusy}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">پایان</label>
            <input 
              type="number" step="any" value={endValue} 
              onChange={(e) => setEndValue(parseFloat(e.target.value))} 
              className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm"
              disabled={isBusy}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">گام</label>
            <input 
              type="number" step="any" value={stepValue} 
              onChange={(e) => setStepValue(parseFloat(e.target.value))} 
              className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm"
              disabled={isBusy}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">حالت تحلیل نتایج</label>
          <select 
            value={analysisMode} 
            onChange={(e) => setAnalysisMode(e.target.value as AnalysisMode)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            disabled={isBusy}
          >
            <option value="performance">عملکرد شبکه</option>
            <option value="security">امنیتی (برای QBER)</option>
            <option value="comprehensive">جامع</option>
          </select>
        </div>

        <button
          onClick={handleRunClick}
          disabled={isBusy || !selectedParameter}
          className="mt-2 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSweeping ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              در حال پیمایش...
            </>
          ) : (
            <><PlayIcon /> اجرای پیمایش</>
          )}
        </button>
      </div>
    </details>
  );
};