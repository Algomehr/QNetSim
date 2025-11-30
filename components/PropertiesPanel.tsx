import React, { useState, useEffect, ChangeEvent } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, AnalysisResult, ComponentType, EdgeData } from '../types';
import { BlochSphere } from './visualizations/BlochSphere';

interface PropertiesPanelProps {
  selectedNode: Node<NodeData> | null | undefined;
  selectedEdge: Edge<EdgeData> | null | undefined;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  onUpdateEdge: (id: string, data: Partial<EdgeData>) => void;
  simulationResult: AnalysisResult | null;
}

const isGate = (type: string) => {
    return [
        ComponentType.Hadamard,
        ComponentType.PauliX,
        ComponentType.CNOT,
        ComponentType.Phase,
        ComponentType.Rz,
        ComponentType.Toffoli,
        ComponentType.PhaseModulator, // New
        ComponentType.BeamSplitter, // New
        ComponentType.PolarizationRotator, // New
        ComponentType.Interferometer, // New
        ComponentType.Waveplate, // New photonic
        ComponentType.Polarizer, // New photonic
        ComponentType.PockelsCell, // New photonic
        ComponentType.EOM, // New photonic
        ComponentType.Custom, // Custom gate is also a gate
    ].includes(type as ComponentType);
};

const NodeProperties: React.FC<{
  node: Node<NodeData>;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  simulationResult: AnalysisResult | null;
}> = ({ node, onUpdateNode, simulationResult }) => {
  const [nodeData, setNodeData] = useState(node.data);

  useEffect(() => {
    setNodeData(node.data);
  }, [node]);

  const handleUpdate = (field: keyof NodeData, value: any) => {
    const newData = { ...nodeData, [field]: value };
    setNodeData(newData);
    onUpdateNode(node.id, { [field]: value });
  };

  const qubitState = (node.type === ComponentType.Qubit || node.type === ComponentType.EndNode) && simulationResult
    ? simulationResult.qubitStates.find(qs => qs.qubit === node.id || qs.qubit === node.data.label)
    : null;
  
  const angleDegrees = nodeData.angle ? (nodeData.angle * 180 / Math.PI).toFixed(0) : '0';
  const phaseShiftDegrees = nodeData.phaseShift ? (nodeData.phaseShift * 180 / Math.PI).toFixed(0) : '0';
  const polarizationRotatorAngleDegrees = nodeData.polarizationRotatorAngle ? (nodeData.polarizationRotatorAngle * 180 / Math.PI).toFixed(0) : '0';
  
  const handleAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const degrees = parseFloat(e.target.value);
    if (!isNaN(degrees)) {
        handleUpdate('angle', (degrees * Math.PI) / 180);
    }
  };

  const handlePhaseShiftChange = (e: ChangeEvent<HTMLInputElement>) => {
    const degrees = parseFloat(e.target.value);
    if (!isNaN(degrees)) {
        handleUpdate('phaseShift', (degrees * Math.PI) / 180);
    }
  };

  const handlePolarizationRotatorAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const degrees = parseFloat(e.target.value);
    if (!isNaN(degrees)) {
        handleUpdate('polarizationRotatorAngle', (degrees * Math.PI) / 180);
    }
  };


  return (
    <>
      <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/10 pb-2 flex-shrink-0">خصوصیات گره</h2>
      <div className="space-y-4 flex-grow overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">برچسب</label>
          <input type="text" value={nodeData.label || ''} onChange={(e) => handleUpdate('label', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">شناسه (ID)</label>
            <p className="text-xs text-gray-500 bg-black/20 p-2 rounded">{node.id}</p>
        </div>
        
        {/* Component-Specific Parameters */}
        <div className="border-t border-white/10 pt-4 space-y-4">
        {(node.type === ComponentType.EndNode || node.type === ComponentType.Source) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">نقش گره</label>
              <select value={nodeData.role ?? 'generic'} onChange={(e) => handleUpdate('role', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                  <option value="sender">فرستنده</option>
                  <option value="receiver">گیرنده</option>
                  <option value="generic">عمومی</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">نوع کدگذاری پایه</label>
              <select value={nodeData.basisEncoding ?? 'polarization'} onChange={(e) => handleUpdate('basisEncoding', e.target.value as 'polarization' | 'phase')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                  <option value="polarization">قطبش</option>
                  <option value="phase">فاز</option>
              </select>
            </div>
          </>
        )}

        {(node.type === ComponentType.Qubit || node.type === ComponentType.EndNode || node.type === ComponentType.Repeater) && (
            <details className="group">
                <summary className="text-sm font-semibold text-gray-300 cursor-pointer list-none flex justify-between items-center">
                    نویز کیوبیت/حافظه (پیشرفته)
                    <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
                </summary>
                <div className="mt-2 space-y-3 p-2 bg-black/20 rounded-md">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">زمان T1 (μs): {nodeData.t1 ?? 100}</label>
                        <input type="number" min="1" max="5000" step="1" value={nodeData.t1 ?? 100} onChange={(e) => handleUpdate('t1', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">زمان T2 (μs): {nodeData.t2 ?? 50}</label>
                        <input type="number" min="1" max="5000" step="1" value={nodeData.t2 ?? 50} onChange={(e) => handleUpdate('t2', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">نرخ میرایی دامنه (0-1): {nodeData.amplitudeDampingRate ?? 0.001}</label>
                        <input type="number" min="0" max="1" step="0.0001" value={nodeData.amplitudeDampingRate ?? 0.001} onChange={(e) => handleUpdate('amplitudeDampingRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">نرخ میرایی فاز (0-1): {nodeData.phaseDampingRate ?? 0.001}</label>
                        <input type="number" min="0" max="1" step="0.0001" value={nodeData.phaseDampingRate ?? 0.001} onChange={(e) => handleUpdate('phaseDampingRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    </div>
                </div>
            </details>
        )}

        {node.type === ComponentType.Repeater && (
          <details className="group">
              <summary className="text-sm font-semibold text-gray-300 cursor-pointer list-none flex justify-between items-center">
                  پارامترهای تکرارگر (پیشرفته)
                  <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
              </summary>
              <div className="mt-2 space-y-3 p-2 bg-black/20 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">وفاداری تعویض ({((nodeData.swapFidelity ?? 0.95) * 100).toFixed(1)}%)</label>
                  <input type="range" min="50" max="100" step="0.1" value={(nodeData.swapFidelity ?? 0.95) * 100} onChange={(e) => handleUpdate('swapFidelity', parseFloat(e.target.value) / 100)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">زمان T1 حافظه (ms): {nodeData.memoryT1 ?? 1000}</label>
                  <input type="range" min="1" max="5000" step="10" value={nodeData.memoryT1 ?? 1000} onChange={(e) => handleUpdate('memoryT1', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">زمان T2 حافظه (ms): {nodeData.memoryT2 ?? 100}</label>
                  <input type="range" min="1" max={(nodeData.memoryT1 ?? 1000) * 2} step="1" value={nodeData.memoryT2 ?? 100} onChange={(e) => handleUpdate('memoryT2', parseInt(e.target.value, 10))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">زمان نگهداری (μs): {nodeData.storageTime ?? 100}</label>
                  <input type="number" min="0" max="1000" step="1" value={nodeData.storageTime ?? 100} onChange={(e) => handleUpdate('storageTime', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">کارایی ذخیره‌سازی (0-1): {nodeData.storageEfficiency ?? 0.99}</label>
                  <input type="number" min="0" max="1" step="0.01" value={nodeData.storageEfficiency ?? 0.99} onChange={(e) => handleUpdate('storageEfficiency', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">نوع نویز حافظه</label>
                  <select value={nodeData.memoryNoiseType ?? 'coherent_dephasing'} onChange={(e) => handleUpdate('memoryNoiseType', e.target.value as 'coherent_dephasing' | 'incoherent_depolarizing')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                      <option value="coherent_dephasing">ناهمدوسی فاز همدوس</option>
                      <option value="incoherent_depolarizing">دپولاریزاسیون ناهمدوس</option>
                  </select>
                </div>
              </div>
          </details>
        )}

        {node.type === ComponentType.Source && (
          <details className="group">
              <summary className="text-sm font-semibold text-gray-300 cursor-pointer list-none flex justify-between items-center">
                  پارامترهای منبع فوتون (پیشرفته)
                  <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
              </summary>
              <div className="mt-2 space-y-3 p-2 bg-black/20 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">نوع فوتون</label>
                  <select value={nodeData.photonType ?? 'single'} onChange={(e) => handleUpdate('photonType', e.target.value as 'single' | 'entangled_pair')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                      <option value="single">تک فوتونی</option>
                      <option value="entangled_pair">جفت درهم‌تنیده</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">طول موج (nm): {nodeData.wavelength ?? 1550}</label>
                  <input type="number" min="100" max="2000" step="1" value={nodeData.wavelength ?? 1550} onChange={(e) => handleUpdate('wavelength', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">خلوص (0-1): {nodeData.purity ?? 0.98}</label>
                  <input type="number" min="0" max="1" step="0.01" value={nodeData.purity ?? 0.98} onChange={(e) => handleUpdate('purity', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
                <h4 className="font-semibold text-gray-300 text-xs mt-3">مشخصات پیشرفته</h4>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">آمار فوتون</label>
                    <select value={nodeData.photonStatistics ?? 'poisson'} onChange={(e) => handleUpdate('photonStatistics', e.target.value as 'poisson' | 'sub_poisson' | 'heralded')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                        <option value="poisson">پواسون</option>
                        <option value="sub_poisson">زیرپواسون</option>
                        <option value="heralded">اعلام‌شده</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">تفکیک‌ناپذیری (0-1): {nodeData.indistinguishability ?? 0.99}</label>
                    <input type="number" min="0" max="1" step="0.001" value={nodeData.indistinguishability ?? 0.99} onChange={(e) => handleUpdate('indistinguishability', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">خلوص طیفی (0-1): {nodeData.spectralPurity ?? 0.99}</label>
                    <input type="number" min="0" max="1" step="0.001" value={nodeData.spectralPurity ?? 0.99} onChange={(e) => handleUpdate('spectralPurity', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">نرخ تکرار (MHz): {nodeData.repetitionRate ?? 100}</label>
                    <input type="number" min="1" max="1000" step="1" value={nodeData.repetitionRate ?? 100} onChange={(e) => handleUpdate('repetitionRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
              </div>
          </details>
        )}

        {node.type === ComponentType.Detector && (
          <details className="group">
              <summary className="text-sm font-semibold text-gray-300 cursor-pointer list-none flex justify-between items-center">
                  پارامترهای آشکارساز
                  <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
              </summary>
              <div className="mt-2 space-y-3 p-2 bg-black/20 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">نوع آشکارساز</label>
                  <select value={nodeData.detectorType ?? 'polarization'} onChange={(e) => handleUpdate('detectorType', e.target.value as 'polarization' | 'phase_interferometer')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                      <option value="polarization">قطبش</option>
                      <option value="phase_interferometer">تداخل‌سنج فاز</option>
                  </select>
                </div>
                {nodeData.detectorType === 'phase_interferometer' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">اختلاف طول بازوی تداخل‌سنج (mm): {nodeData.interferometerArmLengthDifference ?? 10}</label>
                    <input type="number" min="1" max="1000" step="1" value={nodeData.interferometerArmLengthDifference ?? 10} onChange={(e) => handleUpdate('interferometerArmLengthDifference', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                  </div>
                )}
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">کارایی آشکارساز ({((nodeData.efficiency ?? 0.9) * 100).toFixed(1)}%)</label>
                    <input type="range" min="0" max="100" step="0.1" value={(nodeData.efficiency ?? 0.9) * 100} onChange={(e) => handleUpdate('efficiency', parseFloat(e.target.value) / 100)} />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">شمارش تاریک (Hz): {nodeData.darkCounts ?? 10}</label>
                    <input type="number" min="0" max="1000" step="1" value={nodeData.darkCounts ?? 10} onChange={(e) => handleUpdate('darkCounts', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
                 <h4 className="font-semibold text-gray-300 text-xs mt-3">نویز آشکارساز (پیشرفته)</h4>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">زمان مرده (ns): {nodeData.deadTime ?? 100}</label>
                    <input type="number" min="0" max="1000" step="1" value={nodeData.deadTime ?? 100} onChange={(e) => handleUpdate('deadTime', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">احتمال پس‌پالسی (0-1): {nodeData.afterpulsingProbability ?? 0.005}</label>
                    <input type="number" min="0" max="1" step="0.0001" value={nodeData.afterpulsingProbability ?? 0.005} onChange={(e) => handleUpdate('afterpulsingProbability', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">احتمال کراس‌تاک (0-1): {nodeData.crosstalkProbability ?? 0.01}</label>
                    <input type="number" min="0" max="1" step="0.0001" value={nodeData.crosstalkProbability ?? 0.01} onChange={(e) => handleUpdate('crosstalkProbability', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                 </div>
              </div>
          </details>
        )}

        {isGate(node.type) && (
           <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">وفاداری گیت ({((nodeData.gateFidelity ?? 0.999) * 100).toFixed(2)}%)</label>
              <input type="range" min="95" max="100" step="0.01" value={(nodeData.gateFidelity ?? 0.999) * 100} onChange={(e) => handleUpdate('gateFidelity', parseFloat(e.target.value) / 100)} />
            </div>
            {node.type === ComponentType.Rz && (
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">زاویه چرخش (θ): {angleDegrees}°</label>
                  <div className="flex items-center space-x-2 space-x-reverse">
                      <input type="range" min="0" max="360" step="1" value={angleDegrees} onChange={handleAngleChange} />
                      <input type="number" value={angleDegrees} onChange={handleAngleChange} className="w-20 p-2 bg-white/5 border border-white/10 rounded-md text-sm text-center" />
                  </div>
              </div>
            )}
            {node.type === ComponentType.PhaseModulator && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">شیفت فاز (φ): {phaseShiftDegrees}°</label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <input type="range" min="0" max="360" step="1" value={phaseShiftDegrees} onChange={handlePhaseShiftChange} />
                        <input type="number" value={phaseShiftDegrees} onChange={handlePhaseShiftChange} className="w-20 p-2 bg-white/5 border border-white/10 rounded-md text-sm text-center" />
                    </div>
                </div>
            )}
            {node.type === ComponentType.PolarizationRotator && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">زاویه چرخش قطبش (θ): {polarizationRotatorAngleDegrees}°</label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <input type="range" min="0" max="360" step="1" value={polarizationRotatorAngleDegrees} onChange={handlePolarizationRotatorAngleChange} />
                        <input type="number" value={polarizationRotatorAngleDegrees} onChange={handlePolarizationRotatorAngleChange} className="w-20 p-2 bg-white/5 border border-white/10 rounded-md text-sm text-center" />
                    </div>
                </div>
            )}
            {node.type === ComponentType.Waveplate && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ریتاردانس (π رادیان): {(nodeData.retardance / Math.PI).toFixed(2)}π</label>
                    <input type="number" min="0" max="2" step="0.01" value={(nodeData.retardance / Math.PI) ?? 0.5} onChange={(e) => handleUpdate('retardance', parseFloat(e.target.value) * Math.PI)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">زاویه محور سریع (درجه): {nodeData.fastAxisAngle ?? 0}</label>
                    <input type="number" min="0" max="180" step="1" value={nodeData.fastAxisAngle ?? 0} onChange={(e) => handleUpdate('fastAxisAngle', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
            )}
            {node.type === ComponentType.Polarizer && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">نسبت خاموشی: 1:{nodeData.extinctionRatio ?? 1000}</label>
                    <input type="number" min="1" max="100000" step="10" value={nodeData.extinctionRatio ?? 1000} onChange={(e) => handleUpdate('extinctionRatio', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">زاویه محور عبور (درجه): {nodeData.transmissionAxisAngle ?? 0}</label>
                    <input type="number" min="0" max="180" step="1" value={nodeData.transmissionAxisAngle ?? 0} onChange={(e) => handleUpdate('transmissionAxisAngle', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
            )}
            {node.type === ComponentType.PockelsCell && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ولتاژ اعمالی (V): {nodeData.voltage ?? 0}</label>
                    <input type="number" min="0" max="1000" step="1" value={nodeData.voltage ?? 0} onChange={(e) => handleUpdate('voltage', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">ولتاژ نیم‌موج (V): {nodeData.halfWaveVoltage ?? 100}</label>
                    <input type="number" min="1" max="5000" step="10" value={nodeData.halfWaveVoltage ?? 100} onChange={(e) => handleUpdate('halfWaveVoltage', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
            )}
            {node.type === ComponentType.EOM && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ضریب مدولاسیون: {nodeData.modulationIndex ?? 0.5}</label>
                    <input type="number" min="0" max="1" step="0.01" value={nodeData.modulationIndex ?? 0.5} onChange={(e) => handleUpdate('modulationIndex', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                    <label className="block text-sm font-medium text-gray-300 mt-2 mb-1">فرکانس مدولاسیون (Hz): {nodeData.modulationFrequency ?? '1e9'}</label>
                    <input type="number" min="1e6" max="1e12" step="1e6" value={nodeData.modulationFrequency ?? 1e9} onChange={(e) => handleUpdate('modulationFrequency', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                </div>
            )}
            {node.type === ComponentType.Custom && (
                <details open className="group">
                    <summary className="text-sm font-semibold text-gray-300 cursor-pointer list-none flex justify-between items-center">
                        خصوصیات گیت سفارشی
                        <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
                    </summary>
                    <div className="mt-2 space-y-3 p-2 bg-black/20 rounded-md">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">تعداد کیوبیت‌ها:</label>
                            <input type="number" min="1" max="3" step="1" value={nodeData.numQubits ?? 1} onChange={(e) => handleUpdate('numQubits', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">ماتریس یونیری (JSON):</label>
                            <textarea value={nodeData.customGateMatrix || ''} onChange={(e) => handleUpdate('customGateMatrix', e.target.value)} rows={6} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm font-mono resize-y" placeholder="مثال: [[[1,0],[0,0]],[[0,0],[1,0]]] (یک گیت واحد)"></textarea>
                            <p className="text-xs text-gray-500 mt-1">آرایه دو بعدی از اعداد مختلط به فرم `[[[re,im],[re,im]],...]`</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">مدل نویز سفارشی (توضیحات متنی):</label>
                            <textarea value={nodeData.customNoiseModel || ''} onChange={(e) => handleUpdate('customNoiseModel', e.target.value)} rows={3} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm resize-y" placeholder="مثال: نویز دپولاریزه با p=0.05 بعد از گیت."></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">توضیحات سفارشی:</label>
                            <textarea value={nodeData.customDescription || ''} onChange={(e) => handleUpdate('customDescription', e.target.value)} rows={3} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm resize-y" placeholder="توضیح دهید این قطعه سفارشی چه کاری انجام می دهد."></textarea>
                        </div>
                    </div>
                </details>
            )}
          </>
        )}
        </div>

        {qubitState && (
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">وضعیت کیوبیت در کُره بلوخ</h3>
            {qubitState.blochSphere ? <BlochSphere {...qubitState.blochSphere} /> : <p>نمایش ممکن نیست.</p>}
          </div>
        )}
      </div>
    </>
  );
};

const EdgeProperties: React.FC<{
  edge: Edge<EdgeData>;
  onUpdateEdge: (id: string, data: Partial<EdgeData>) => void;
}> = ({ edge, onUpdateEdge }) => {
    const [edgeData, setEdgeData] = useState(edge.data);

    useEffect(() => {
        setEdgeData(edge.data);
    }, [edge]);

    const handleUpdate = (field: keyof EdgeData, value: any) => {
        if(!edge.id) return;
        const newData = { ...edgeData, [field]: value };
        setEdgeData(newData);
        onUpdateEdge(edge.id, { [field]: value });
    };

    return (
        <>
            <h2 className="text-lg font-bold text-cyan-400 mb-4 border-b border-white/10 pb-2 flex-shrink-0">خصوصیات کانال</h2>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">شناسه (ID)</label>
                    <p className="text-xs text-gray-500 bg-black/20 p-2 rounded">{edge.id}</p>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">نوع کانال</label>
                        <select value={edgeData?.type ?? 'quantum'} onChange={(e) => handleUpdate('type', e.target.value as 'quantum' | 'classical')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                            <option value="quantum">کوانتومی</option>
                            <option value="classical">کلاسیک</option>
                        </select>
                    </div>
                     {edgeData?.type === 'quantum' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">طول کانال (km): {edgeData?.length ?? 10}</label>
                                <input type="range" min="1" max="250" step="1" value={edgeData?.length ?? 10} onChange={(e) => handleUpdate('length', parseInt(e.target.value, 10))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">تضعیف (dB/km): {edgeData?.attenuation ?? 0.2}</label>
                                <input type="range" min="0.1" max="1" step="0.01" value={edgeData?.attenuation ?? 0.2} onChange={(e) => handleUpdate('attenuation', parseFloat(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">دیسپرسیون (ps/(nm·km)): {edgeData?.dispersion ?? 0.1}</label>
                                <input type="range" min="0" max="20" step="0.01" value={edgeData?.dispersion ?? 0.1} onChange={(e) => handleUpdate('dispersion', parseFloat(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">اتلاف وابسته به قطبش (dB): {edgeData?.polarizationDependentLoss ?? 0.05}</label>
                                <input type="range" min="0" max="1" step="0.01" value={edgeData?.polarizationDependentLoss ?? 0.05} onChange={(e) => handleUpdate('polarizationDependentLoss', parseFloat(e.target.value))} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">دما (K): {edgeData?.temperature ?? 295}</label>
                                <input type="range" min="273" max="373" step="1" value={edgeData?.temperature ?? 295} onChange={(e) => handleUpdate('temperature', parseInt(e.target.value, 10))} />
                            </div>
                            <h4 className="font-semibold text-gray-300 text-sm mt-3">نویز کانال (پیشرفته)</h4>
                             <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">چگالی طیفی نویز حرارتی (W/Hz): {edgeData.thermalNoiseSpectralDensity?.toExponential(2) ?? '1e-18'}</label>
                                <input type="number" min="0" max="1e-15" step="1e-19" value={edgeData.thermalNoiseSpectralDensity ?? 1e-18} onChange={(e) => handleUpdate('thermalNoiseSpectralDensity', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">نرخ دپولاریزاسیون (0-1 /km): {edgeData.channelDepolarizingRate ?? 0.0001}</label>
                                <input type="number" min="0" max="1" step="0.00001" value={edgeData.channelDepolarizingRate ?? 0.0001} onChange={(e) => handleUpdate('channelDepolarizingRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">نرخ دفیزیگ (0-1 /km): {edgeData.channelDephasingRate ?? 0.0001}</label>
                                <input type="number" min="0" max="1" step="0.00001" value={edgeData.channelDephasingRate ?? 0.0001} onChange={(e) => handleUpdate('channelDephasingRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>

                            <h4 className="font-semibold text-gray-300 text-sm mt-3">نوع کانال و محیط</h4>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">نوع فیزیکی کانال</label>
                                <select value={edgeData.channelType ?? 'fiber'} onChange={(e) => handleUpdate('channelType', e.target.value as 'fiber' | 'free_space')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                                    <option value="fiber">فیبر نوری</option>
                                    <option value="free_space">فضای آزاد</option>
                                </select>
                            </div>
                            {edgeData.channelType === 'free_space' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">تلاطم اتمسفر</label>
                                        <select value={edgeData.atmosphericTurbulence ?? 'weak'} onChange={(e) => handleUpdate('atmosphericTurbulence', e.target.value as 'weak' | 'moderate' | 'strong')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                                            <option value="weak">ضعیف</option>
                                            <option value="moderate">متوسط</option>
                                            <option value="strong">شدید</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">شدت فیدینگ</label>
                                        <select value={edgeData.fadingSeverity ?? 'none'} onChange={(e) => handleUpdate('fadingSeverity', e.target.value as 'none' | 'low' | 'medium' | 'high')} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                                            <option value="none">بدون فیدینگ</option>
                                            <option value="low">کم</option>
                                            <option value="medium">متوسط</option>
                                            <option value="high">زیاد</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </>
                     )}
                     {edgeData?.type === 'classical' && (
                        <>
                            <h4 className="font-semibold text-gray-300 text-sm mt-3">مشخصات کانال کلاسیک</h4>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">پهنای باند (Mbps): {edgeData?.classicalBandwidth ?? 100}</label>
                                <input type="number" min="1" max="10000" step="1" value={edgeData?.classicalBandwidth ?? 100} onChange={(e) => handleUpdate('classicalBandwidth', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">تاخیر (ms): {edgeData?.classicalLatency ?? 5}</label>
                                <input type="number" min="0" max="1000" step="1" value={edgeData?.classicalLatency ?? 5} onChange={(e) => handleUpdate('classicalLatency', parseInt(e.target.value, 10))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">نرخ خطا (0-1): {edgeData?.classicalErrorRate ?? 0.001}</label>
                                <input type="number" min="0" max="1" step="0.0001" value={edgeData?.classicalErrorRate ?? 0.001} onChange={(e) => handleUpdate('classicalErrorRate', parseFloat(e.target.value))} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, selectedEdge, onUpdateNode, onUpdateEdge, simulationResult }) => {
  return (
    <div className="p-4 flex flex-col h-full">
        {selectedEdge ? (
            <EdgeProperties edge={selectedEdge} onUpdateEdge={onUpdateEdge} />
        ) : selectedNode ? (
            <NodeProperties node={selectedNode} onUpdateNode={onUpdateNode} simulationResult={simulationResult} />
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500">یک گره یا کانال را برای مشاهده خصوصیات انتخاب کنید.</p>
            </div>
        )}
    </div>
  );
};