import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  BackgroundVariant,
  ReactFlowInstance,
} from 'reactflow';
import { ComponentType } from '../types';
import { CustomNode } from './nodes/CustomNode';
import { QubitIcon, HadamardIcon, CnotIcon, MeasureIcon, SourceIcon, DetectorIcon, PhaseIcon, RzIcon, XIcon, ToffoliIcon, EavesdropperIcon, EndNodeIcon, RepeaterIcon, PhaseModulatorIcon, BeamSplitterIcon, PolarizationRotatorIcon, InterferometerIcon } from './icons/QuantumIcons';

interface QuantumCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onInit: (instance: ReactFlowInstance) => void;
}

const iconMap: Record<ComponentType, React.ReactNode> = {
    [ComponentType.Qubit]: <QubitIcon />,
    [ComponentType.Hadamard]: <HadamardIcon />,
    [ComponentType.CNOT]: <CnotIcon />,
    [ComponentType.Measure]: <MeasureIcon />,
    [ComponentType.Source]: <SourceIcon />,
    [ComponentType.Detector]: <DetectorIcon />,
    [ComponentType.Phase]: <PhaseIcon />,
    [ComponentType.Rz]: <RzIcon />,
    [ComponentType.PauliX]: <XIcon />,
    [ComponentType.Toffoli]: <ToffoliIcon />,
    [ComponentType.Eavesdropper]: <EavesdropperIcon />,
    [ComponentType.EndNode]: <EndNodeIcon />,
    [ComponentType.Repeater]: <RepeaterIcon />,
    [ComponentType.PhaseModulator]: <PhaseModulatorIcon />,
    [ComponentType.BeamSplitter]: <BeamSplitterIcon />,
    [ComponentType.PolarizationRotator]: <PolarizationRotatorIcon />,
    [ComponentType.Interferometer]: <InterferometerIcon />,
    [ComponentType.Custom]: <div />,
};

const getNodeIcon = (type: string) => {
    return iconMap[type as ComponentType] || null;
};

const WrappedCustomNode = (props: any) => {
  const icon = getNodeIcon(props.type);
  const dataWithIcon = { ...props.data, icon: icon, isConnectable: props.isConnectable };
  return <CustomNode {...props} data={dataWithIcon} />;
};


export const QuantumCanvas: React.FC<QuantumCanvasProps> = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  onDragOver,
  onDrop,
  onInit,
}) => {
  const nodeTypes = useMemo(() => ({
    qubit: WrappedCustomNode,
    hadamard: WrappedCustomNode,
    cnot: WrappedCustomNode,
    measure: WrappedCustomNode,
    source: WrappedCustomNode,
    detector: WrappedCustomNode,
    phase: WrappedCustomNode,
    rz: WrappedCustomNode,
    x: WrappedCustomNode,
    toffoli: WrappedCustomNode,
    eavesdropper: WrappedCustomNode,
    endNode: WrappedCustomNode,
    repeater: WrappedCustomNode,
    phaseModulator: WrappedCustomNode,
    beamSplitter: WrappedCustomNode,
    polarizationRotator: WrappedCustomNode,
    interferometer: WrappedCustomNode,
    custom: CustomNode,
  }), []);

  return (
    <div className="flex-grow h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        className="bg-transparent"
        defaultEdgeOptions={{
            style: { strokeWidth: 2, stroke: '#0e7490' },
            type: 'smoothstep',
        }}
      >
        <Controls className="[&>button]:bg-gray-800/80 [&>button]:border-white/10 [&>button:hover]:bg-gray-700 [&_path]:fill-white" />
        <MiniMap nodeStrokeColor="#06b6d4" nodeColor="#1f2937" className="!bg-gray-900/80 !border-white/10" pannable zoomable />
        <Background gap={24} color="rgba(255, 255, 255, 0.05)" variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
};