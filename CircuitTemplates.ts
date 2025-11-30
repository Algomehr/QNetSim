import { Position } from 'reactflow';
import { CircuitTemplate, ComponentType } from './types';
import { getDefaultParameters } from './constants'; // Import getDefaultParameters

// Re-using common handle definitions for CNOT and Toffoli
const cnotHandles = [
  { type: 'target' as const, position: Position.Top, id: 'ctl_in' },
  { type: 'source' as const, position: Position.Top, id: 'ctl_out' },
  { type: 'target' as const, position: Position.Bottom, id: 'tgt_in' },
  { type: 'source' as const, position: Position.Bottom, id: 'tgt_out' },
];

const toffoliHandles = [
  { type: 'target' as const, position: Position.Top, id: 'ctl1_in' },
  { type: 'source' as const, position: Position.Top, id: 'ctl1_out' },
  { type: 'target' as const, position: Position.Left, id: 'tgt_in' },
  { type: 'source' as const, position: Position.Right, id: 'tgt_out' },
  { type: 'target' as const, position: Position.Bottom, id: 'ctl2_in' },
  { type: 'source' as const, position: Position.Bottom, id: 'ctl2_out' },
];

// --- Helper for default quantum edge data ---
const defaultQuantumEdgeData = {
  type: 'quantum' as const,
  length: 10,
  attenuation: 0.2,
  dispersion: 0.1,
  polarizationDependentLoss: 0.05,
  temperature: 295,
  thermalNoiseSpectralDensity: 1e-18,
  channelDepolarizingRate: 0.0001,
  channelDephasingRate: 0.0001,
  channelType: 'fiber' as const,
  atmosphericTurbulence: 'weak' as const, // Only relevant if channelType becomes 'free_space'
  fadingSeverity: 'none' as const,     // Only relevant if channelType becomes 'free_space'
};

// --- Helper for default classical edge data ---
const defaultClassicalEdgeData = {
  type: 'classical' as const,
  length: 1, // Classical link length can be minimal
  attenuation: 0, // No attenuation for classical
  classicalBandwidth: 100, // Mbps
  classicalLatency: 5,     // ms
  classicalErrorRate: 0.001, // 0 to 1
};


// --- مبانی کوانتوم ---
const bellStateTemplate: CircuitTemplate = {
  name: "حالت بِل (درهم‌تنیدگی)",
  description: "یک مدار پایه برای درهم‌تنیده کردن دو کیوبیت.",
  category: "مبانی کوانتوم",
  circuit: {
    nodes: [
      { id: 'q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'کیوبیت |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'کیوبیت |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'گیت H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'cnot1', type: ComponentType.CNOT, position: { x: 350, y: 175 }, data: { label: 'CNOT', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'm0', type: ComponentType.Measure, position: { x: 500, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'm1', type: ComponentType.Measure, position: { x: 500, y: 250 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
    ],
    edges: [
      { id: 'e_q0_h1', source: 'q0', target: 'h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_h1_cnot1', source: 'h1', target: 'cnot1', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_cnot1_m0', source: 'cnot1', sourceHandle: 'ctl_out', target: 'm0', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_q1_cnot1', source: 'q1', target: 'cnot1', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_cnot1_m1', source: 'cnot1', sourceHandle: 'tgt_out', target: 'm1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
    ],
  },
};

const ghzStateTemplate: CircuitTemplate = {
  name: "حالت GHZ (درهم‌تنیدگی ۳ کیوبیت)",
  description: "ایجاد حالت maximally entangled برای سه کیوبیت.",
  category: "مبانی کوانتوم",
  circuit: {
    nodes: [
      { id: 'ghz_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'ghz_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'ghz_q2', type: ComponentType.Qubit, position: { x: 50, y: 400 }, data: { label: 'q2 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'ghz_h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'گیت H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'ghz_cnot1', type: ComponentType.CNOT, position: { x: 350, y: 175 }, data: { label: 'CNOT', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'ghz_cnot2', type: ComponentType.CNOT, position: { x: 500, y: 250 }, data: { label: 'CNOT', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'ghz_m0', type: ComponentType.Measure, position: { x: 650, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'ghz_m1', type: ComponentType.Measure, position: { x: 650, y: 250 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'ghz_m2', type: ComponentType.Measure, position: { x: 650, y: 400 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
    ],
    edges: [
      { id: 'e_ghz_q0_h1', source: 'ghz_q0', target: 'ghz_h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_h1_cnot1', source: 'ghz_h1', target: 'ghz_cnot1', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_q1', source: 'ghz_q1', target: 'ghz_cnot1', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_cnot2', source: 'ghz_cnot1', sourceHandle: 'ctl_out', target: 'ghz_cnot2', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_q2', source: 'ghz_q2', target: 'ghz_cnot2', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_m1', source: 'ghz_cnot1', sourceHandle: 'tgt_out', target: 'ghz_m1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_m0', source: 'ghz_cnot2', sourceHandle: 'ctl_out', target: 'ghz_m0', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_m2', source: 'ghz_cnot2', sourceHandle: 'tgt_out', target: 'ghz_m2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
    ]
  }
};


// --- پروتکل‌های ارتباطی ---
const teleportationTemplate: CircuitTemplate = {
  name: "دورنوردی کوانتومی",
  description: "انتقال حالت یک کیوبیت به دیگری با استفاده از درهم‌تنیدگی.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'q_psi', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: '|ψ⟩ (منبع)', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'q_alice', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'کیوبیت آلیس', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'q_bob', type: ComponentType.EndNode, position: { x: 50, y: 400 }, data: { label: 'کیوبیت باب', ...getDefaultParameters(ComponentType.EndNode) } }, // Changed to EndNode for advanced params
      { id: 'h1', type: ComponentType.Hadamard, position: { x: 200, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'cnot1', type: ComponentType.CNOT, position: { x: 350, y: 325 }, data: { label: 'CNOT', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'cnot2', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'CNOT', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'h2', type: ComponentType.Hadamard, position: { x: 650, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'm1', type: ComponentType.Measure, position: { x: 800, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'm2', type: ComponentType.Measure, position: { x: 800, y: 250 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'x_corr', type: ComponentType.PauliX, position: { x: 650, y: 400 }, data: { label: 'تصحیح X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'z_corr', type: ComponentType.Rz, position: { x: 800, y: 400 }, data: { label: 'تصحیح Z', angle: Math.PI, ...getDefaultParameters(ComponentType.Rz) } },
      { id: 'm3', type: ComponentType.Measure, position: { x: 950, y: 400 }, data: { label: 'نتیجه نهایی', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'c_comm', type: ComponentType.EndNode, position: { x: 950, y: 175 }, data: { label: 'ارتباط کلاسیک', role: 'generic' } } // Placeholder for classical comm
    ],
    edges: [
      { id: 'e1', source: 'q_alice', target: 'h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e2', source: 'h1', target: 'cnot1', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e3', source: 'q_bob', target: 'cnot1', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e4', source: 'cnot1', sourceHandle: 'ctl_out', target: 'cnot2', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e5', source: 'q_psi', target: 'cnot2', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e6', source: 'cnot2', sourceHandle: 'ctl_out', target: 'h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e7', source: 'h2', target: 'm1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e8', source: 'cnot2', sourceHandle: 'tgt_out', target: 'm2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Classical Communication for correction bits
      { id: 'e_c_comm1', source: 'm1', target: 'c_comm', animated: true, data: { ...defaultClassicalEdgeData } },
      { id: 'e_c_comm2', source: 'm2', target: 'c_comm', animated: true, data: { ...defaultClassicalEdgeData } },
      { id: 'e_c_comm_x', source: 'c_comm', target: 'x_corr', animated: true, data: { ...defaultClassicalEdgeData, classicalLatency: 10 } },
      { id: 'e_c_comm_z', source: 'c_comm', target: 'z_corr', animated: true, data: { ...defaultClassicalEdgeData, classicalLatency: 10 } },
      // Quantum path to Bob's corrections
      { id: 'e9', source: 'cnot1', sourceHandle: 'tgt_out', target: 'x_corr', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e10', source: 'x_corr', target: 'z_corr', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e11', source: 'z_corr', target: 'm3', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }
    ]
  }
};

const repeaterTemplate: CircuitTemplate = {
    name: "توزیع درهم‌تنیدگی با تکرارگر",
    description: "نمایش یک لینک تکرارگر کوانتومی که درهم‌تنیدگی را بین دو گره دور توزیع می‌کند.",
    category: "پروتکل‌های ارتباطی",
    circuit: {
        nodes: [
            {
                id: 'source_A',
                type: ComponentType.Source, // Changed to Source
                position: { x: 100, y: 100 },
                data: {
                    label: 'منبع A',
                    photonType: 'entangled_pair',
                    ...getDefaultParameters(ComponentType.Source)
                }
            },
            { id: 'alice', type: ComponentType.EndNode, position: { x: 100, y: 300 }, data: { label: 'آلیس', role: 'receiver', ...getDefaultParameters(ComponentType.EndNode) } },
            { id: 'repeater', type: ComponentType.Repeater, position: { x: 350, y: 200 }, data: { label: 'تکرارگر', ...getDefaultParameters(ComponentType.Repeater) } },
            {
                id: 'source_B',
                type: ComponentType.Source, // Changed to Source
                position: { x: 600, y: 100 },
                data: {
                    label: 'منبع B',
                    photonType: 'entangled_pair',
                    ...getDefaultParameters(ComponentType.Source)
                }
            },
            { id: 'bob', type: ComponentType.EndNode, position: { x: 600, y: 300 }, data: { label: 'باب', role: 'receiver', ...getDefaultParameters(ComponentType.EndNode) } },
        ],
        edges: [
            { id: 'e_sa_alice', source: 'source_A', target: 'alice', animated: true, data: { ...defaultQuantumEdgeData, length: 5, attenuation: 0.2 } },
            { id: 'e_sa_repeater', source: 'source_A', target: 'repeater', animated: true, data: { ...defaultQuantumEdgeData, length: 50, attenuation: 0.25, dispersion: 0.2 } },
            { id: 'e_sb_bob', source: 'source_B', target: 'bob', animated: true, data: { ...defaultQuantumEdgeData, length: 5, attenuation: 0.2 } },
            { id: 'e_sb_repeater', source: 'source_B', target: 'repeater', animated: true, data: { ...defaultQuantumEdgeData, length: 50, attenuation: 0.25, dispersion: 0.2 } },
            // Classical channel for entanglement swapping signaling
            { id: 'e_classical_rep_ab', source: 'repeater', target: 'alice', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 50, classicalLatency: 20 } },
            { id: 'e_classical_rep_ba', source: 'repeater', target: 'bob', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 50, classicalLatency: 20 } },
            { id: 'e_classical_alice_bob', source: 'alice', target: 'bob', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 10, classicalLatency: 100 } },
        ]
    }
};

const bb84PolarizationNoEveTemplate: CircuitTemplate = {
  name: "پروتکل BB84 (قطبش، کانال امن)",
  description: "شبیه‌سازی BB84 مبتنی بر قطبش بدون شنودگر، با نمایش اجزای آماده‌سازی و اندازه‌گیری.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'bb84_source', type: ComponentType.Source, position: { x: 50, y: 200 }, data: { label: "منبع آلیس", basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.Source) } },
      { id: 'bb84_end_alice', type: ComponentType.EndNode, position: { x: 150, y: 200 }, data: { label: "آلیس", role: 'sender', basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.EndNode) } },
      { id: 'bb84_end_bob', type: ComponentType.EndNode, position: { x: 550, y: 200 }, data: { label: "باب", role: 'receiver', basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.EndNode) } },
      { id: 'bb84_detector_bob', type: ComponentType.Detector, position: { x: 650, y: 200 }, data: { label: "آشکارساز باب", detectorType: 'polarization', ...getDefaultParameters(ComponentType.Detector) } },
    ],
    edges: [
      { id: 'e_bb84_source_alice', source: 'bb84_source', target: 'bb84_end_alice', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }, // Internal connection
      { id: 'e_bb84_quantum_channel', source: 'bb84_end_alice', target: 'bb84_end_bob', animated: true, data: { ...defaultQuantumEdgeData, length: 50, attenuation: 0.2, dispersion: 0.15 } },
      { id: 'e_bb84_bob_detector', source: 'bb84_end_bob', target: 'bb84_detector_bob', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }, // Internal connection
      // Classical channel for sifting
      { id: 'e_bb84_classical_sifting', source: 'bb84_end_alice', target: 'bb84_end_bob', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 10, classicalLatency: 50 } },
    ],
  },
};

const bb84PolarizationWithEveTemplate: CircuitTemplate = {
  name: "پروتکل BB84 (قطبش، با شنودگر)",
  description: "شبیه‌سازی توزیع کلید کوانتومی مبتنی بر قطبش با یک شنودگر در کانال.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'bb84e_source', type: ComponentType.Source, position: { x: 50, y: 200 }, data: { label: "منبع آلیس", basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.Source) } },
      { id: 'bb84e_end_alice', type: ComponentType.EndNode, position: { x: 150, y: 200 }, data: { label: "آلیس", role: 'sender', basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.EndNode) } },
      { id: 'bb84e_eve', type: ComponentType.Eavesdropper, position: { x: 350, y: 200 }, data: { label: 'Eve (شنودگر)', ...getDefaultParameters(ComponentType.Eavesdropper) } },
      { id: 'bb84e_end_bob', type: ComponentType.EndNode, position: { x: 550, y: 200 }, data: { label: "باب", role: 'receiver', basisEncoding: 'polarization', ...getDefaultParameters(ComponentType.EndNode) } },
      { id: 'bb84e_detector_bob', type: ComponentType.Detector, position: { x: 650, y: 200 }, data: { label: "آشکارساز باب", detectorType: 'polarization', ...getDefaultParameters(ComponentType.Detector) } },
    ],
    edges: [
      { id: 'e_bb84e_source_alice', source: 'bb84e_source', target: 'bb84e_end_alice', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bb84e_alice_eve', source: 'bb84e_end_alice', target: 'bb84e_eve', animated: true, data: { ...defaultQuantumEdgeData, length: 20, attenuation: 0.2 } },
      { id: 'e_bb84e_eve_bob', source: 'bb84e_eve', target: 'bb84e_end_bob', animated: true, data: { ...defaultQuantumEdgeData, length: 20, attenuation: 0.2 } },
      { id: 'e_bb84e_bob_detector', source: 'bb84e_end_bob', target: 'bb84e_detector_bob', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Classical channel for sifting (via Eve - Eve might intercept or relay)
      { id: 'e_bb84e_classical_sifting', source: 'bb84e_end_alice', target: 'bb84e_end_bob', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 10, classicalLatency: 50 } },
    ],
  },
};

const bb84PhaseBasedTemplate: CircuitTemplate = {
  name: "پروتکل BB84 (فاز، کانال امن)",
  description: "شبیه‌سازی BB84 مبتنی بر فاز با مدولاتورهای فاز و تداخل‌سنج.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'bb84p_source', type: ComponentType.Source, position: { x: 50, y: 200 }, data: { label: "منبع تک فوتونی", basisEncoding: 'phase', ...getDefaultParameters(ComponentType.Source) } },
      { id: 'bb84p_alice_pm', type: ComponentType.PhaseModulator, position: { x: 250, y: 200 }, data: { label: "PM آلیس", phaseShift: Math.PI / 2, ...getDefaultParameters(ComponentType.PhaseModulator) } },
      { id: 'bb84p_quantum_channel', type: ComponentType.EndNode, position: { x: 450, y: 200 }, data: { label: "کانال کوانتومی", role: 'generic' } }, // Represents the link
      { id: 'bb84p_bob_pm', type: ComponentType.PhaseModulator, position: { x: 650, y: 200 }, data: { label: "PM باب", phaseShift: 0, ...getDefaultParameters(ComponentType.PhaseModulator) } },
      { id: 'bb84p_detector', type: ComponentType.Detector, position: { x: 850, y: 200 }, data: { label: "آشکارساز باب", detectorType: 'phase_interferometer', interferometerArmLengthDifference: 10, ...getDefaultParameters(ComponentType.Detector) } },
    ],
    edges: [
      { id: 'e_source_pm_alice', source: 'bb84p_source', target: 'bb84p_alice_pm', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_pm_alice_channel', source: 'bb84p_alice_pm', target: 'bb84p_quantum_channel', animated: true, data: { ...defaultQuantumEdgeData, length: 30, attenuation: 0.2, dispersion: 0.15, channelDephasingRate: 0.0005 } },
      { id: 'e_channel_pm_bob', source: 'bb84p_quantum_channel', target: 'bb84p_bob_pm', animated: true, data: { ...defaultQuantumEdgeData, length: 30, attenuation: 0.2, dispersion: 0.15, channelDephasingRate: 0.0005 } },
      { id: 'e_pm_bob_detector', source: 'bb84p_bob_pm', target: 'bb84p_detector', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Classical channel for sifting
      { id: 'e_classical_sifting', source: 'bb84p_alice_pm', target: 'bb84p_bob_pm', animated: false, data: { ...defaultClassicalEdgeData, classicalBandwidth: 5, classicalLatency: 60 } },
    ],
  },
};


// --- الگوریتم‌های کوانتومی ---
const deutschJozsaTemplate: CircuitTemplate = {
  name: "الگوریتم دویچ-جوزا",
  description: "تعیین می‌کند که یک تابع 'جعبه سیاه' ثابت است یا متوازن.",
  category: "الگوریتم‌های کوانتومی",
  circuit: {
    nodes: [
      { id: 'dj_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'dj_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'dj_x1', type: ComponentType.PauliX, position: { x: 200, y: 250 }, data: { label: 'X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'dj_h1', type: ComponentType.Hadamard, position: { x: 350, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'dj_h2', type: ComponentType.Hadamard, position: { x: 350, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'dj_oracle', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'Oracle (متوازن)', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'dj_h3', type: ComponentType.Hadamard, position: { x: 650, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'dj_m0', type: ComponentType.Measure, position: { x: 800, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } }
    ],
    edges: [
      { id: 'e_dj1', source: 'dj_q0', target: 'dj_h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj2', source: 'dj_q1', target: 'dj_x1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj3', source: 'dj_x1', target: 'dj_h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj4', source: 'dj_h1', target: 'dj_oracle', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj5', source: 'dj_h2', target: 'dj_oracle', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj6', source: 'dj_oracle', sourceHandle: 'ctl_out', target: 'dj_h3', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_dj7', source: 'dj_h3', target: 'dj_m0', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }
    ]
  }
};

const groverSearchTemplate: CircuitTemplate = {
  name: "جستجوی گروور (۲ کیوبیت)",
  description: "پیدا کردن حالت |11⟩ در میان چهار حالت ممکن.",
  category: "الگوریتم‌های کوانتومی",
  circuit: {
    nodes: [
      { id: 'g_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'g_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'g_h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_h2', type: ComponentType.Hadamard, position: { x: 200, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      // Oracle for |11> (Controlled-Z)
      { id: 'g_oracle_h', type: ComponentType.Hadamard, position: { x: 350, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_oracle_cnot', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'Oracle', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'g_oracle_h2', type: ComponentType.Hadamard, position: { x: 650, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      // Diffuser
      { id: 'g_d_h1', type: ComponentType.Hadamard, position: { x: 800, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_d_h2', type: ComponentType.Hadamard, position: { x: 800, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_d_x1', type: ComponentType.PauliX, position: { x: 950, y: 100 }, data: { label: 'X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'g_d_x2', type: ComponentType.PauliX, position: { x: 950, y: 250 }, data: { label: 'X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'g_d_cz_h', type: ComponentType.Hadamard, position: { x: 1100, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_d_cz_cnot', type: ComponentType.CNOT, position: { x: 1250, y: 175 }, data: { label: 'Diffuser', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'g_d_cz_h2', type: ComponentType.Hadamard, position: { x: 1400, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_d_x3', type: ComponentType.PauliX, position: { x: 1550, y: 100 }, data: { label: 'X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'g_d_x4', type: ComponentType.PauliX, position: { x: 1550, y: 250 }, data: { label: 'X', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'g_d_h3', type: ComponentType.Hadamard, position: { x: 1700, y: 100 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_d_h4', type: ComponentType.Hadamard, position: { x: 1700, y: 250 }, data: { label: 'H', ...getDefaultParameters(ComponentType.Hadamard) } },
      { id: 'g_m1', type: ComponentType.Measure, position: { x: 1850, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'g_m2', type: ComponentType.Measure, position: { x: 1850, y: 250 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } }
    ],
    edges: [
      // Init
      { id: 'ge1', source: 'g_q0', target: 'g_h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge2', source: 'g_q1', target: 'g_h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Oracle
      { id: 'ge3', source: 'g_h1', target: 'g_oracle_cnot', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge4', source: 'g_h2', target: 'g_oracle_h', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge5', source: 'g_oracle_h', target: 'g_oracle_cnot', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge6', source: 'g_oracle_cnot', sourceHandle: 'tgt_out', target: 'g_oracle_h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Diffuser
      { id: 'ge7', source: 'g_oracle_cnot', sourceHandle: 'ctl_out', target: 'g_d_h1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge8', source: 'g_oracle_h2', target: 'g_d_h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge9', source: 'g_d_h1', target: 'g_d_x1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge10', source: 'g_d_h2', target: 'g_d_x2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge11', source: 'g_d_x1', target: 'g_d_cz_cnot', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge12', source: 'g_d_x2', target: 'g_d_cz_h', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge13', source: 'g_d_cz_h', target: 'g_d_cz_cnot', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge14', source: 'g_d_cz_cnot', sourceHandle: 'tgt_out', target: 'g_d_cz_h2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge15', source: 'g_d_cz_cnot', sourceHandle: 'ctl_out', target: 'g_d_x3', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge16', source: 'g_d_cz_h2', target: 'g_d_x4', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge17', source: 'g_d_x3', target: 'g_d_h3', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge18', source: 'g_d_x4', target: 'g_d_h4', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Measure
      { id: 'ge19', source: 'g_d_h3', target: 'g_m1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'ge20', source: 'g_d_h4', target: 'g_m2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }
    ]
  }
};


// --- تصحیح خطای کوانتومی ---
const bitFlipCodeTemplate: CircuitTemplate = {
  name: "کد Bit-Flip (کدگذاری و خطا)",
  description: "کدگذاری کیوبیت برای محافظت در برابر خطای bit-flip.",
  category: "تصحیح خطای کوانتومی",
  circuit: {
    nodes: [
      { id: 'bfc_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: '|ψ⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'bfc_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'ancilla |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'bfc_q2', type: ComponentType.Qubit, position: { x: 50, y: 400 }, data: { label: 'ancilla |0⟩', ...getDefaultParameters(ComponentType.Qubit) } },
      { id: 'bfc_cnot1', type: ComponentType.CNOT, position: { x: 250, y: 175 }, data: { label: 'Encode', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'bfc_cnot2', type: ComponentType.CNOT, position: { x: 400, y: 250 }, data: { label: 'Encode', handles: cnotHandles, ...getDefaultParameters(ComponentType.CNOT) } },
      { id: 'bfc_error', type: ComponentType.PauliX, position: { x: 550, y: 250 }, data: { label: 'خطای Bit-Flip', ...getDefaultParameters(ComponentType.PauliX) } },
      { id: 'bfc_m0', type: ComponentType.Measure, position: { x: 700, y: 100 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'bfc_m1', type: ComponentType.Measure, position: { x: 700, y: 250 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } },
      { id: 'bfc_m2', type: ComponentType.Measure, position: { x: 700, y: 400 }, data: { label: 'اندازه‌گیری', ...getDefaultParameters(ComponentType.Measure) } }
    ],
    edges: [
      // Encoding
      { id: 'e_bfc1', source: 'bfc_q0', target: 'bfc_cnot1', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bfc2', source: 'bfc_q1', target: 'bfc_cnot1', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bfc3', source: 'bfc_cnot1', sourceHandle: 'ctl_out', target: 'bfc_cnot2', targetHandle: 'ctl_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bfc4', source: 'bfc_q2', target: 'bfc_cnot2', targetHandle: 'tgt_in', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Error
      { id: 'e_bfc5', source: 'bfc_cnot1', sourceHandle: 'tgt_out', target: 'bfc_error', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      // Measurement
      { id: 'e_bfc6', source: 'bfc_cnot2', sourceHandle: 'ctl_out', target: 'bfc_m0', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bfc7', source: 'bfc_error', target: 'bfc_m1', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } },
      { id: 'e_bfc8', source: 'bfc_cnot2', sourceHandle: 'tgt_out', target: 'bfc_m2', animated: true, data: { ...defaultQuantumEdgeData, length: 0, attenuation: 0 } }
    ]
  }
};

export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  // New Categories First
  {
    ...deutschJozsaTemplate,
    category: "الگوریتم‌های کوانتومی",
  },
  {
    ...groverSearchTemplate,
    category: "الگوریتم‌های کوانتومی",
  },
  {
    ...teleportationTemplate,
    category: "پروتکل‌های ارتباطی",
  },
  {
    ...repeaterTemplate,
    category: "پروتکل‌های ارتباطی",
  },
  {
    ...bb84PolarizationNoEveTemplate,
    category: "پروتکل‌های ارتباطی",
  },
  {
    ...bb84PolarizationWithEveTemplate,
    category: "پروتکل‌های ارتباطی",
  },
  {
    ...bb84PhaseBasedTemplate,
    category: "پروتکل‌های ارتباطی",
  },
   {
    ...bitFlipCodeTemplate,
    category: "تصحیح خطای کوانتومی",
  },
  // Basic templates
  {
    ...bellStateTemplate,
    category: "مبانی کوانتوم",
  },
  {
    ...ghzStateTemplate,
    category: "مبانی کوانتوم",
  },
];