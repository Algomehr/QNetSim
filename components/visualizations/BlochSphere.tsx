import React from 'react';

interface BlochSphereProps {
  theta: number; // Polar angle in radians (0 to PI)
  phi: number;   // Azimuthal angle in radians (0 to 2*PI)
  purity?: number; // Length of the Bloch vector, 0 to 1. Defaults to 1.
}

export const BlochSphere: React.FC<BlochSphereProps> = ({ theta, phi, purity = 1 }) => {
  const R = 100; // Radius of the sphere
  const vectorLength = R * purity;

  // Convert spherical coordinates to 3D Cartesian coordinates
  const x = vectorLength * Math.sin(theta) * Math.cos(phi);
  const y = vectorLength * Math.sin(theta) * Math.sin(phi);
  const z = vectorLength * Math.cos(theta);

  // Simple 2D projection: we'll use (y, -z) for our SVG coordinates
  const svgX = y;
  const svgY = -z;

  // Use the x coordinate for a subtle depth effect (opacity)
  const depthOpacity = 0.6 + (x / R) * 0.4;

  const textStyle: React.CSSProperties = {
      fontSize: '14px',
      fill: '#9ca3af', // text-gray-400
      fontFamily: 'Vazirmatn, sans-serif',
      textAnchor: 'middle',
  };

  return (
    <svg viewBox="-120 -120 240 240" width="100%" height="auto">
      {/* Sphere and Axes */}
      <defs>
        <radialGradient id="sphereGradient" cx="0.25" cy="0.25" r="0.75">
          <stop offset="0%" stopColor="#374151" /> 
          <stop offset="100%" stopColor="#111827" /> 
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r={R} fill="url(#sphereGradient)" stroke="#4b5563" strokeWidth="1" />
      <ellipse cx="0" cy="0" rx={R} ry={25} fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="0" y1={-R} x2="0" y2={R} stroke="#6b7280" strokeWidth="1" />
      <line x1={-R} y1="0" x2={R} y2="0" stroke="#6b7280" strokeWidth="1" />

      {/* Axis Labels */}
      <text x="0" y={-R - 8} style={textStyle}>|0⟩</text>
      <text x="0" y={R + 18} style={textStyle}>|1⟩</text>
      <text x={R + 12} y="5" style={textStyle}>|+⟩</text>
      <text x={-R - 12} y="5" style={textStyle}>|-⟩</text>
      <text x="-15" y="-30" style={{...textStyle, fontSize:'12px'}}>|i⟩</text>
      <text x="15" y="36" style={{...textStyle, fontSize:'12px'}}>|-i⟩</text>

      {/* State Vector */}
      <g opacity={depthOpacity}>
        <line x1="0" y1="0" x2={svgX} y2={svgY} stroke="#22d3ee" strokeWidth="2.5" />
        <circle cx={svgX} cy={svgY} r="4" fill="#22d3ee" stroke={purity < 0.99 ? "white" : "#22d3ee"} strokeWidth={purity < 0.99 ? 1 : 0} />
      </g>
    </svg>
  );
};
