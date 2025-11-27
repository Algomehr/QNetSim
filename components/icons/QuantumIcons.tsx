import React from 'react';

export const QubitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18L12 6M6 12l6 6 6-6M6 12l6-6 6 6" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const HadamardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">H</text>
  </svg>
);

export const CnotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="7" r="2" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6" />
    <circle cx="12" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M12 13v8" />
  </svg>
);

export const MeasureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="5" y="8" width="14" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 12.5a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M12 8.5v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SourceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const DetectorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const PhaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">S</text>
  </svg>
);

export const RzIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <text x="12" y="16" fontSize="9" textAnchor="middle" fill="currentColor" fontWeight="bold">Rz(θ)</text>
    </svg>
  );
  
export const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <text x="12" y="16" fontSize="12" textAnchor="middle" fill="currentColor" fontWeight="bold">X</text>
  </svg>
);

export const ToffoliIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="4" r="2" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v5" />
    <circle cx="12" cy="13" r="2" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3" />
    <circle cx="12" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8M12 16v8" />
  </svg>
);

export const EavesdropperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0012 4.5c4.717 0 8.825 2.555 10.02 6.39.114.37.114.764 0 1.134A10.473 10.473 0 0112 19.5c-4.717 0-8.825-2.555-10.02-6.39a.994.994 0 010-1.134z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const EndNodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.375 1.5-3 3 0 01-1.5 1.5H5.25m13.5 0H15v-2.25A2.25 2.25 0 0012.75 15H11.25A2.25 2.25 0 009 17.25v2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.75a9 9 0 11-6 16.5 9 9 0 016-16.5z" />
    </svg>
);

export const RepeaterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
);

export const PhaseModulatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-3l3 3 3-3M6 12h12m-3-3l3 3-3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="12" y="14" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">φ</text>
    </svg>
);

export const BeamSplitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12.75 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12L8 4M16 20L8 12M12 4V20" />
        <line x1="16" y1="4" x2="8" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="16" y1="12" x2="8" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="12" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export const PolarizationRotatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5l3.5 3.5M12 6.5L8.5 10M12 6.5V17.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="12" y="13" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">θ</text>
    </svg>
);

export const InterferometerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7M12 5L5 12l7 7" />
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="5" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="19" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="5" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="19" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="12" y="14" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">λ</text>
    </svg>
);