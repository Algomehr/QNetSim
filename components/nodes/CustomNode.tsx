import React, { memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../types';

interface CustomNodeProps extends NodeProps {
  data: NodeData & {
    icon: ReactNode;
    isConnectable?: boolean;
    // Fix: Changed 'string' to 'Position' for handle position type
    handles?: { type: 'source' | 'target'; position: Position; id: string }[];
  };
}

const CustomNodeComponent: React.FC<CustomNodeProps> = ({ data }) => {
  const handles = data.handles || [
    { type: 'target', position: Position.Left, id: 'left' },
    { type: 'source', position: Position.Right, id: 'right' },
  ];

  let displayLabel = data.label;
  if (typeof data.angle === 'number') {
    displayLabel = `${data.label} (${(data.angle * 180 / Math.PI).toFixed(0)}°)`
  } else if (typeof data.phaseShift === 'number') {
    displayLabel = `${data.label} (${(data.phaseShift * 180 / Math.PI).toFixed(0)}°)`
  } else if (typeof data.polarizationRotatorAngle === 'number') {
    displayLabel = `${data.label} (${(data.polarizationRotatorAngle * 180 / Math.PI).toFixed(0)}°)`
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-cyan-500/60 rounded-xl shadow-lg shadow-cyan-500/20 w-36 h-28 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-400/30 hover:scale-105 group">
      <div className="text-cyan-300 text-3xl mb-2 transition-colors group-hover:text-cyan-200">{data.icon}</div>
      <div className="text-sm font-bold text-gray-100">{displayLabel}</div>
      {handles.map(handle => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className="!bg-teal-400 !border-2 !border-gray-900 !w-3.5 !h-3.5"
          isConnectable={data.isConnectable}
        />
      ))}
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);