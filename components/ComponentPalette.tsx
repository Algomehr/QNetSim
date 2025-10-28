import React from 'react';
import { QUANTUM_COMPONENTS } from '../constants';
import { ComponentType, QuantumComponent } from '../types';
import { QubitIcon, HadamardIcon, CnotIcon, MeasureIcon, SourceIcon, DetectorIcon, PhaseIcon, RzIcon, XIcon, ToffoliIcon, EavesdropperIcon, EndNodeIcon, RepeaterIcon } from './icons/QuantumIcons';

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
    [ComponentType.Custom]: <div />,
};

const onDragStart = (event: React.DragEvent, nodeType: ComponentType, label: string) => {
  const nodeData = { nodeType, label };
  event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
  event.dataTransfer.effectAllowed = 'move';
};

const groupedComponents = QUANTUM_COMPONENTS.reduce((acc, component) => {
  const category = component.category || 'متفرقه';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(component);
  return acc;
}, {} as Record<string, QuantumComponent[]>);


export const ComponentPalette: React.FC = () => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category}>
            <h4 className="font-semibold text-gray-400 mb-2 text-sm px-1">{category}</h4>
            <div className="space-y-3">
              {components.map((component) => (
                <div
                  id={`component-palette-${component.type}`}
                  key={component.id}
                  onDragStart={(event) => onDragStart(event, component.type, component.label)}
                  draggable
                  className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-grab flex items-center space-x-3 space-x-reverse transition-all duration-200 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:scale-105 group"
                >
                  <div className="text-cyan-400 text-3xl group-hover:text-cyan-300 transition-colors">{iconMap[component.type]}</div>
                  <div>
                    <p className="font-semibold text-white">{component.label}</p>
                    <p className="text-xs text-gray-400">{component.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};