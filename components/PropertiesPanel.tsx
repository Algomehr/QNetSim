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
        ComponentType.Toffoli
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
  
  const handleAngleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const degrees = parseFloat(e.target.value);
    if (!isNaN(degrees)) {
        handleUpdate('angle', (degrees * Math.PI) / 180);
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
        {node.type === ComponentType.EndNode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">نقش گره</label>
              <select value={nodeData.role ?? 'generic'} onChange={(e) => handleUpdate('role', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm">
                  <option value="sender">فرستنده</option>
                  <option value="receiver">گیرنده</option>
                  <option value="generic">عمومی</option>
              </select>
            </div>
          </>
        )}

        {node.type === ComponentType.Repeater && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">وفاداری تعویض ({((nodeData.swapFidelity ?? 0.95) * 100).toFixed(1)}%)</label>
              <input type="range" min="50" max="100" step="0.1" value={(nodeData.swapFidelity ?? 0.95) * 100} onChange={(e) => handleUpdate('swapFidelity', parseFloat(e.target.value) / 100)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">زمان T1 حافظه (ms): {nodeData.memoryT1 ?? 1000}</label>
              <input type="range" min="1" max="5000" step="10" value={nodeData.memoryT1 ?? 1000} onChange={(e) => handleUpdate('memoryT1', parseInt(e.target.value, 10))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">زمان T2 حافظه (ms): {nodeData.memoryT2 ?? 100}</label>
              <input type="range" min="1" max={(nodeData.memoryT1 ?? 1000) * 2} step="1" value={nodeData.memoryT2 ?? 100} onChange={(e) => handleUpdate('memoryT2', parseInt(e.target.value, 10))} />
            </div>
          </>
        )}

        {node.type === ComponentType.Qubit && (
          <>
            {/* Qubit parameters from before */}
          </>
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