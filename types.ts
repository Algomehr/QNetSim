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
  // New Network Components for Advanced Implementation
  PhaseModulator = 'phaseModulator',
  BeamSplitter = 'beamSplitter',
  PolarizationRotator = 'polarizationRotator',
  Interferometer = 'interferometer',
  // New Photonic Components
  Waveplate = 'waveplate',
  Polarizer = 'polarizer',
  PockelsCell = 'pockelsCell',
  EOM = 'eom',
}

export interface EdgeData {
  type: 'quantum' | 'classical';
  length: number; // in km
  attenuation: number; // in dB/km
  noiseType?: 'depolarizing' | 'dephasing';
  noiseProbability?: number; // 0 to 1
  // New channel characteristics for realism
  dispersion?: number; // in ps/(nm·km)
  polarizationDependentLoss?: number; // in dB
  temperature?: number; // in Kelvin
  // Advanced Channel Noise Parameters
  thermalNoiseSpectralDensity?: number; // e.g., in W/Hz
  channelDepolarizingRate?: number; // 0 to 1, per km
  channelDephasingRate?: number; // 0 to 1, per km
  // Advanced Channel Types for realism
  channelType?: 'fiber' | 'free_space';
  atmosphericTurbulence?: 'weak' | 'moderate' | 'strong'; // For free-space channels
  fadingSeverity?: 'none' | 'low' | 'medium' | 'high'; // For free-space channels
  // New: Classical Channel Parameters
  classicalBandwidth?: number; // in Mbps
  classicalLatency?: number; // in ms
  classicalErrorRate?: number; // 0 to 1
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
  basisEncoding?: 'polarization' | 'phase'; // How qubits are encoded by source/endnode
  // Advanced Source Parameters
  photonStatistics?: 'poisson' | 'sub_poisson' | 'heralded';
  indistinguishability?: number; // 0 to 1
  spectralPurity?: number; // 0 to 1
  repetitionRate?: number; // in MHz

  // Detector
  efficiency?: number; // 0 to 1
  darkCounts?: number; // in Hz
  detectorType?: 'polarization' | 'phase_interferometer';
  interferometerArmLengthDifference?: number; // in mm, for phase detection
  // Advanced Detector Noise
  deadTime?: number; // in ns
  afterpulsingProbability?: number; // 0 to 1
  crosstalkProbability?: number; // 0 to 1, simplified for multi-channel detectors

  // Gates (H, X, CNOT, S, Rz, Toffoli) & New Gates
  gateFidelity?: number; // 0 to 1
  gateTime?: number; // in ns
  phaseShift?: number; // For PhaseModulator, Rz gate, in radians

  // Polarization Rotator
  polarizationRotatorAngle?: number; // in radians

  // Qubit, EndNode, Repeater (memory)
  initialState?: 0 | 1;
  t1?: number; // in microseconds
  t2?: number; // in microseconds
  // Advanced Qubit/Memory Noise
  amplitudeDampingRate?: number; // 0 to 1, per unit time/gate
  phaseDampingRate?: number; // 0 to 1, per unit time/gate
  // Advanced Repeater Memory Parameters
  storageTime?: number; // in microseconds, for repeater memory
  storageEfficiency?: number; // 0 to 1, for repeater memory
  memoryNoiseType?: 'coherent_dephasing' | 'incoherent_depolarizing';

  // Eavesdropper
  attackStrategy?: 'intercept_resend';
  basisChoiceBias?: number; // 0 to 1

  // EndNode
  role?: 'sender' | 'receiver' | 'generic';

  // Repeater
  swapFidelity?: number; // 0 to 1
  memoryT1?: number; // in ms
  memoryT2?: number; // in ms

  // Waveplate
  retardance?: number; // in radians or fractions of lambda (e.g., 0.5 for half-wave)
  fastAxisAngle?: number; // in degrees

  // Polarizer
  extinctionRatio?: number; // e.g., 10000:1, stored as ratio
  transmissionAxisAngle?: number; // in degrees

  // Pockels Cell
  voltage?: number; // applied voltage
  halfWaveVoltage?: number; // voltage for pi phase shift

  // EOM (Electro-Optic Modulator)
  modulationIndex?: number; // modulation depth
  modulationFrequency?: number; // in Hz
  // For Custom nodes
  numQubits?: number; // How many qubits the custom gate acts on
  customGateMatrix?: string; // JSON string of complex 2D array: [[[re, im], [re, im]], ...]
  customNoiseModel?: string; // Text description of custom noise
  customDescription?: string; // User-friendly description
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
  totalDispersion?: number; // in ps/nm
  totalPDL?: number; // in dB
  totalThermalNoise?: number; // sum of thermal noise per channel
  totalFreeSpaceTurbulenceImpact?: number; // Simplified cumulative impact
  totalFreeSpaceFadingImpact?: number; // Simplified cumulative impact
  // New: Classical Channel Stats
  totalClassicalBandwidth?: number; // in Mbps
  totalClassicalLatency?: number; // in ms
}

// New interface for structured error contributions
export interface ErrorContribution {
  source: string; // e.g., "Channel 1 Attenuation"
  contribution: number; // Percentage, e.g., 25 for 25%
  description: string; // Explanation of the error
}

// New interfaces for Parameter Sweeping
export type SweepTargetType = 'node' | 'edge';
export type SweepParameter = keyof NodeData | keyof EdgeData | 'qber' | 'fidelity' | 'keyRate' | 'latency';

export interface ParameterSweepSettings {
  parameter: SweepParameter;
  targetId: string | null; // ID of the node or edge to sweep, null for global/network-wide
  targetType: SweepTargetType | null;
  range: {
    start: number;
    end: number;
    step: number;
  };
}

export interface SweepResultEntry {
  value: number; // The parameter value for this simulation run
  qber?: number;
  fidelity?: number;
  keyRate?: number;
  latency?: number;
}

export interface SweepResult {
  parameter: SweepParameter;
  unit?: string; // e.g., "km", "%", "dB"
  results: SweepResultEntry[];
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
  errorSourceAnalysis?: ErrorContribution[] | string; // Can be structured or string
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
  wignerQFunctionDescription?: string; // Textual description for advanced visualizations
  sweepResults?: SweepResult[]; // Results from parameter sweeping
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
    parameter: keyof NodeData | keyof EdgeData; 
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