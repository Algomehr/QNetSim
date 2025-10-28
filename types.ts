import { Node, Edge } from 'reactflow';

export enum ComponentType {
  Qubit = 'qubit',
  Hadamard = 'hadamard',
  CNOT = 'cnot',
  Measure = 'measure',
  Source = 'source',
  Detector = 'detector',
  Phase = 'phase',
  Rz = 'rz',
  PauliX = 'x',
  Toffoli = 'toffoli',
  Custom = 'custom',
  Eavesdropper = 'eavesdropper',
  EndNode = 'endNode',
  Repeater = 'repeater',
}

export interface EdgeData {
  type: 'quantum' | 'classical';
  length: number; // in km
  attenuation: number; // in dB/km
  noiseType?: 'depolarizing' | 'dephasing';
  noiseProbability?: number; // 0 to 1
}

export interface NodeData {
  label: string;
  angle?: number; // Optional angle in radians
  handles?: { type: 'source' | 'target'; position: string; id: string }[];
  
  // New Component-Specific Parameters
  // Source
  photonType?: 'single' | 'entangled_pair';
  wavelength?: number; // in nm
  purity?: number; // 0 to 1

  // Detector
  efficiency?: number; // 0 to 1
  darkCounts?: number; // in Hz

  // Gates (H, X, CNOT, S, Rz, Toffoli)
  gateFidelity?: number; // 0 to 1
  gateTime?: number; // in ns

  // Qubit
  initialState?: 0 | 1;
  t1?: number; // in microseconds
  t2?: number; // in microseconds

  // Eavesdropper
  attackStrategy?: 'intercept_resend';
  basisChoiceBias?: number; // 0 to 1

  // EndNode
  role?: 'sender' | 'receiver' | 'generic';

  // Repeater
  swapFidelity?: number; // 0 to 1
  memoryT1?: number; // in ms
  memoryT2?: number; // in ms
}

export interface QuantumComponent {
  id: string;
  type: ComponentType;
  label: string;
  description: string;
  category: string;
}

export interface CircuitData {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}

export type CouplingMap = 'fully-connected' | 'linear-chain';

export interface SimulationSettings {
  shots: number;
  gateErrorProbability: number; // 0 to 1
  decoherenceStrength: number; // 0 to 1 - Kept for simple mode
  // Advanced Settings
  enableAdvanced: boolean;
  couplingMap: CouplingMap;
  t1: number; // in microseconds
  t2: number; // in microseconds
  readoutError: number; // 0 to 1
}

export interface CircuitTemplate {
  name: string;
  description: string;
  category: string;
  circuit: CircuitData;
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
export type AnalysisMode = 'comprehensive' | 'security' | 'performance' | 'state' | 'errorBudget' | 'educational';

export interface QubitState {
  qubit: string;
  state: string; // Simplified textual state for list view
  blochSphere?: {
    theta: number; // Polar angle in radians (0 to PI)
    phi: number;   // Azimuthal angle in radians (0 to 2*PI)
    purity?: number; // Length of the Bloch vector (0 to 1), 1 is pure, <1 is mixed
  };
}

export interface MeasurementProbability {
  state: string; // e.g., "01", "10"
  probability: number; // e.g., 0.5 for 50%
}


// New interface for QKD analysis keys
export interface ProtocolKeyInfo {
  aliceSentBasis?: string;
  bobMeasureBasis?: string;
  eveEavesdropBasis?: string;
  aliceSiftedKey?: string;
  bobSiftedKey?: string;
  eveSiftedKey?: string;
}

// New interface for QKD analysis results
export interface ProtocolAnalysis {
  protocolName: string;
  qber: number;
  securityAssessment: string;
  keys: ProtocolKeyInfo;
}

export interface NetworkPerformanceMetrics {
    endToEndFidelity?: number;
    keyRate?: number; // in bits/sec
    latency?: number; // in ms
    successProbability?: number;
}

export interface ProtocolTraceEvent {
    nodeId: string;
    nodeLabel: string;
    event: string;
    description: string;
    time?: number; // in ms
    state?: string; // Optional state representation at this point
}

// New interface for real-time network health stats
export interface NetworkStats {
  totalLength: number; // in km
  totalAttenuation: number; // in dB
  estimatedLatency: number; // in ms
  networkSurvivalProbability: number; // 0 to 1
}


// This is the new, comprehensive result type that merges simulation and explanation.
export interface AnalysisResult {
  title: string;
  objective: string;
  theoreticalBackground: string;
  experimentalSetupAnalogy: string;
  stepByStepExplanation?: { // Made optional
    nodeId: string;
    gateName: string;
    description: string;
    stateVectorAfter: string;
  }[];
  protocolTrace?: ProtocolTraceEvent[]; // Added for network simulation
  resultsAnalysis: string;
  // New fields for advanced analysis
  errorSourceAnalysis?: string;
  optimizationSuggestions?: string;
  potentialApplications?: string;
  
  measurementProbabilities: MeasurementProbability[];
  finalStateVector: string;
  qubitStates: QubitState[];
  // The following are for noisy/shot-based simulation
  densityMatrix?: string;
  measurementCounts?: { state: string; count: number }[];
  protocolAnalysis?: ProtocolAnalysis; // For QKD protocols like BB84
  networkPerformance?: NetworkPerformanceMetrics; // Added for network simulation
}

// --- Tutorial System Types ---
export type TutorialStepAction = 
  | 'drag-component' 
  | 'connect-nodes'
  | 'click-element'
  | 'set-parameter'
  | 'read';

export interface TutorialStep {
  title: string;
  content: string;
  targetId?: string; // ID of element to highlight
  action: TutorialStepAction;
  // Optional parameters for action validation
  expectedComponents?: { type: ComponentType; count: number }[];
  expectedConnections?: {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }[];
  expectedParameter?: { 
    nodeId: string;
    parameter: keyof NodeData; 
    value: any;
  };
  expectedClickValue?: AnalysisMode;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: TutorialStep[];
}