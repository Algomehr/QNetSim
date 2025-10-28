import { Position } from 'reactflow';
import { CircuitTemplate, ComponentType } from './types';

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

// --- مبانی کوانتوم ---
const bellStateTemplate: CircuitTemplate = {
  name: "حالت بِل (درهم‌تنیدگی)",
  description: "یک مدار پایه برای درهم‌تنیده کردن دو کیوبیت.",
  category: "مبانی کوانتوم",
  circuit: {
    nodes: [
      { id: 'q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'کیوبیت |0⟩' } },
      { id: 'q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'کیوبیت |0⟩' } },
      { id: 'h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'گیت H' } },
      { id: 'cnot1', type: ComponentType.CNOT, position: { x: 350, y: 175 }, data: { label: 'CNOT', handles: cnotHandles } },
      { id: 'm0', type: ComponentType.Measure, position: { x: 500, y: 100 }, data: { label: 'اندازه‌گیری' } },
      { id: 'm1', type: ComponentType.Measure, position: { x: 500, y: 250 }, data: { label: 'اندازه‌گیری' } },
    ],
    edges: [
      { id: 'e_q0_h1', source: 'q0', target: 'h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_h1_cnot1', source: 'h1', target: 'cnot1', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_cnot1_m0', source: 'cnot1', sourceHandle: 'ctl_out', target: 'm0', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_q1_cnot1', source: 'q1', target: 'cnot1', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_cnot1_m1', source: 'cnot1', sourceHandle: 'tgt_out', target: 'm1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
    ],
  },
};

const ghzStateTemplate: CircuitTemplate = {
  name: "حالت GHZ (درهم‌تنیدگی ۳ کیوبیت)",
  description: "ایجاد حالت maximally entangled برای سه کیوبیت.",
  category: "مبانی کوانتوم",
  circuit: {
    nodes: [
      { id: 'ghz_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩' } },
      { id: 'ghz_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩' } },
      { id: 'ghz_q2', type: ComponentType.Qubit, position: { x: 50, y: 400 }, data: { label: 'q2 |0⟩' } },
      { id: 'ghz_h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'گیت H' } },
      { id: 'ghz_cnot1', type: ComponentType.CNOT, position: { x: 350, y: 175 }, data: { label: 'CNOT', handles: cnotHandles } },
      { id: 'ghz_cnot2', type: ComponentType.CNOT, position: { x: 500, y: 250 }, data: { label: 'CNOT', handles: cnotHandles } },
      { id: 'ghz_m0', type: ComponentType.Measure, position: { x: 650, y: 100 }, data: { label: 'اندازه‌گیری' } },
      { id: 'ghz_m1', type: ComponentType.Measure, position: { x: 650, y: 250 }, data: { label: 'اندازه‌گیری' } },
      { id: 'ghz_m2', type: ComponentType.Measure, position: { x: 650, y: 400 }, data: { label: 'اندازه‌گیری' } },
    ],
    edges: [
      { id: 'e_ghz_q0_h1', source: 'ghz_q0', target: 'ghz_h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_h1_cnot1', source: 'ghz_h1', target: 'ghz_cnot1', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_q1', source: 'ghz_q1', target: 'ghz_cnot1', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_cnot2', source: 'ghz_cnot1', sourceHandle: 'ctl_out', target: 'ghz_cnot2', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_q2', source: 'ghz_q2', target: 'ghz_cnot2', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot1_m1', source: 'ghz_cnot1', sourceHandle: 'tgt_out', target: 'ghz_m1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_m0', source: 'ghz_cnot2', sourceHandle: 'ctl_out', target: 'ghz_m0', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_ghz_cnot2_m2', source: 'ghz_cnot2', sourceHandle: 'tgt_out', target: 'ghz_m2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
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
      { id: 'q_psi', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: '|ψ⟩ (منبع)' } },
      { id: 'q_alice', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'کیوبیت آلیس' } },
      { id: 'q_bob', type: ComponentType.EndNode, position: { x: 50, y: 400 }, data: { label: 'کیوبیت باب' } },
      { id: 'h1', type: ComponentType.Hadamard, position: { x: 200, y: 250 }, data: { label: 'H' } },
      { id: 'cnot1', type: ComponentType.CNOT, position: { x: 350, y: 325 }, data: { label: 'CNOT', handles: cnotHandles } },
      { id: 'cnot2', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'CNOT', handles: cnotHandles } },
      { id: 'h2', type: ComponentType.Hadamard, position: { x: 650, y: 100 }, data: { label: 'H' } },
      { id: 'm1', type: ComponentType.Measure, position: { x: 800, y: 100 }, data: { label: 'اندازه‌گیری' } },
      { id: 'm2', type: ComponentType.Measure, position: { x: 800, y: 250 }, data: { label: 'اندازه‌گیری' } },
      { id: 'x_corr', type: ComponentType.PauliX, position: { x: 650, y: 400 }, data: { label: 'تصحیح X' } },
      { id: 'z_corr', type: ComponentType.Rz, position: { x: 800, y: 400 }, data: { label: 'تصحیح Z', angle: Math.PI } },
      { id: 'm3', type: ComponentType.Measure, position: { x: 950, y: 400 }, data: { label: 'نتیجه نهایی' } }
    ],
    edges: [
      { id: 'e1', source: 'q_alice', target: 'h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e2', source: 'h1', target: 'cnot1', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e3', source: 'q_bob', target: 'cnot1', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e4', source: 'cnot1', sourceHandle: 'ctl_out', target: 'cnot2', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e5', source: 'q_psi', target: 'cnot2', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e6', source: 'cnot2', sourceHandle: 'ctl_out', target: 'h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e7', source: 'h2', target: 'm1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e8', source: 'cnot2', sourceHandle: 'tgt_out', target: 'm2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e9', source: 'cnot1', sourceHandle: 'tgt_out', target: 'x_corr', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e10', source: 'x_corr', target: 'z_corr', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e11', source: 'z_corr', target: 'm3', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } }
    ]
  }
};

const repeaterTemplate: CircuitTemplate = {
    name: "توزیع درهم‌تنیدگی با تکرارگر",
    description: "استفاده از تکرارگر برای ایجاد درهم‌تنیدگی بین دو گره دور.",
    category: "پروتکل‌های ارتباطی",
    circuit: {
        nodes: [
            { id: 'alice', type: ComponentType.EndNode, position: { x: 50, y: 200 }, data: { label: 'آلیس', role: 'sender' } },
            { id: 'repeater', type: ComponentType.Repeater, position: { x: 350, y: 200 }, data: { label: 'تکرارگر', swapFidelity: 0.95 } },
            { id: 'bob', type: ComponentType.EndNode, position: { x: 650, y: 200 }, data: { label: 'باب', role: 'receiver' } },
        ],
        edges: [
            { id: 'e_alice_repeater', source: 'alice', target: 'repeater', animated: true, data: { type: 'quantum', length: 50, attenuation: 0.2 } },
            { id: 'e_repeater_bob', source: 'repeater', target: 'bob', animated: true, data: { type: 'quantum', length: 50, attenuation: 0.2 } },
        ]
    }
};

const bb84NoEveTemplate: CircuitTemplate = {
  name: "پروتکل BB84 (کانال امن)",
  description: "شبیه‌سازی BB84 بدون حضور شنودگر برای مقایسه.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'alice_s', type: ComponentType.EndNode, position: { x: 50, y: 200 }, data: { label: 'آلیس (فرستنده)', role: 'sender' } },
      { id: 'bob_s', type: ComponentType.EndNode, position: { x: 450, y: 200 }, data: { label: 'باب (گیرنده)', role: 'receiver' } },
    ],
    edges: [
      { id: 'e_alice_bob_s', source: 'alice_s', target: 'bob_s', animated: true, data: { type: 'quantum', length: 25, attenuation: 0.2 } },
    ],
  },
};

const bb84Template: CircuitTemplate = {
  name: "پروتکل BB84 با شنودگر",
  description: "شبیه‌سازی توزیع کلید کوانتومی با حضور Eve.",
  category: "پروتکل‌های ارتباطی",
  circuit: {
    nodes: [
      { id: 'alice', type: ComponentType.EndNode, position: { x: 50, y: 200 }, data: { label: 'آلیس (فرستنده)', role: 'sender' } },
      { id: 'eve', type: ComponentType.Eavesdropper, position: { x: 300, y: 200 }, data: { label: 'Eve (شنودگر)' } },
      { id: 'bob', type: ComponentType.EndNode, position: { x: 550, y: 200 }, data: { label: 'باب (گیرنده)', role: 'receiver' } },
    ],
    edges: [
      { id: 'e_alice_eve', source: 'alice', target: 'eve', animated: true, data: { type: 'quantum', length: 10, attenuation: 0.2 } },
      { id: 'e_eve_bob', source: 'eve', target: 'bob', animated: true, data: { type: 'quantum', length: 10, attenuation: 0.2 } },
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
      { id: 'dj_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩' } },
      { id: 'dj_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩' } },
      { id: 'dj_x1', type: ComponentType.PauliX, position: { x: 200, y: 250 }, data: { label: 'X' } },
      { id: 'dj_h1', type: ComponentType.Hadamard, position: { x: 350, y: 100 }, data: { label: 'H' } },
      { id: 'dj_h2', type: ComponentType.Hadamard, position: { x: 350, y: 250 }, data: { label: 'H' } },
      { id: 'dj_oracle', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'Oracle (متوازن)', handles: cnotHandles } },
      { id: 'dj_h3', type: ComponentType.Hadamard, position: { x: 650, y: 100 }, data: { label: 'H' } },
      { id: 'dj_m0', type: ComponentType.Measure, position: { x: 800, y: 100 }, data: { label: 'اندازه‌گیری' } }
    ],
    edges: [
      { id: 'e_dj1', source: 'dj_q0', target: 'dj_h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj2', source: 'dj_q1', target: 'dj_x1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj3', source: 'dj_x1', target: 'dj_h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj4', source: 'dj_h1', target: 'dj_oracle', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj5', source: 'dj_h2', target: 'dj_oracle', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj6', source: 'dj_oracle', sourceHandle: 'ctl_out', target: 'dj_h3', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_dj7', source: 'dj_h3', target: 'dj_m0', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } }
    ]
  }
};

const groverSearchTemplate: CircuitTemplate = {
  name: "جستجوی گروور (۲ کیوبیت)",
  description: "پیدا کردن حالت |11⟩ در میان چهار حالت ممکن.",
  category: "الگوریتم‌های کوانتومی",
  circuit: {
    nodes: [
      { id: 'g_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: 'q0 |0⟩' } },
      { id: 'g_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'q1 |0⟩' } },
      { id: 'g_h1', type: ComponentType.Hadamard, position: { x: 200, y: 100 }, data: { label: 'H' } },
      { id: 'g_h2', type: ComponentType.Hadamard, position: { x: 200, y: 250 }, data: { label: 'H' } },
      // Oracle for |11> (Controlled-Z)
      { id: 'g_oracle_h', type: ComponentType.Hadamard, position: { x: 350, y: 250 }, data: { label: 'H' } },
      { id: 'g_oracle_cnot', type: ComponentType.CNOT, position: { x: 500, y: 175 }, data: { label: 'Oracle', handles: cnotHandles } },
      { id: 'g_oracle_h2', type: ComponentType.Hadamard, position: { x: 650, y: 250 }, data: { label: 'H' } },
      // Diffuser
      { id: 'g_d_h1', type: ComponentType.Hadamard, position: { x: 800, y: 100 }, data: { label: 'H' } },
      { id: 'g_d_h2', type: ComponentType.Hadamard, position: { x: 800, y: 250 }, data: { label: 'H' } },
      { id: 'g_d_x1', type: ComponentType.PauliX, position: { x: 950, y: 100 }, data: { label: 'X' } },
      { id: 'g_d_x2', type: ComponentType.PauliX, position: { x: 950, y: 250 }, data: { label: 'X' } },
      { id: 'g_d_cz_h', type: ComponentType.Hadamard, position: { x: 1100, y: 250 }, data: { label: 'H' } },
      { id: 'g_d_cz_cnot', type: ComponentType.CNOT, position: { x: 1250, y: 175 }, data: { label: 'Diffuser', handles: cnotHandles } },
      { id: 'g_d_cz_h2', type: ComponentType.Hadamard, position: { x: 1400, y: 250 }, data: { label: 'H' } },
      { id: 'g_d_x3', type: ComponentType.PauliX, position: { x: 1550, y: 100 }, data: { label: 'X' } },
      { id: 'g_d_x4', type: ComponentType.PauliX, position: { x: 1550, y: 250 }, data: { label: 'X' } },
      { id: 'g_d_h3', type: ComponentType.Hadamard, position: { x: 1700, y: 100 }, data: { label: 'H' } },
      { id: 'g_d_h4', type: ComponentType.Hadamard, position: { x: 1700, y: 250 }, data: { label: 'H' } },
      { id: 'g_m1', type: ComponentType.Measure, position: { x: 1850, y: 100 }, data: { label: 'اندازه‌گیری' } },
      { id: 'g_m2', type: ComponentType.Measure, position: { x: 1850, y: 250 }, data: { label: 'اندازه‌گیری' } }
    ],
    edges: [
      // Init
      { id: 'ge1', source: 'g_q0', target: 'g_h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge2', source: 'g_q1', target: 'g_h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      // Oracle
      { id: 'ge3', source: 'g_h1', target: 'g_oracle_cnot', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge4', source: 'g_h2', target: 'g_oracle_h', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge5', source: 'g_oracle_h', target: 'g_oracle_cnot', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge6', source: 'g_oracle_cnot', sourceHandle: 'tgt_out', target: 'g_oracle_h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      // Diffuser
      { id: 'ge7', source: 'g_oracle_cnot', sourceHandle: 'ctl_out', target: 'g_d_h1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge8', source: 'g_oracle_h2', target: 'g_d_h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge9', source: 'g_d_h1', target: 'g_d_x1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge10', source: 'g_d_h2', target: 'g_d_x2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge11', source: 'g_d_x1', target: 'g_d_cz_cnot', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge12', source: 'g_d_x2', target: 'g_d_cz_h', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge13', source: 'g_d_cz_h', target: 'g_d_cz_cnot', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge14', source: 'g_d_cz_cnot', sourceHandle: 'tgt_out', target: 'g_d_cz_h2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge15', source: 'g_d_cz_cnot', sourceHandle: 'ctl_out', target: 'g_d_x3', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge16', source: 'g_d_cz_h2', target: 'g_d_x4', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge17', source: 'g_d_x3', target: 'g_d_h3', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge18', source: 'g_d_x4', target: 'g_d_h4', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      // Measure
      { id: 'ge19', source: 'g_d_h3', target: 'g_m1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'ge20', source: 'g_d_h4', target: 'g_m2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } }
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
      { id: 'bfc_q0', type: ComponentType.Qubit, position: { x: 50, y: 100 }, data: { label: '|ψ⟩' } },
      { id: 'bfc_q1', type: ComponentType.Qubit, position: { x: 50, y: 250 }, data: { label: 'ancilla |0⟩' } },
      { id: 'bfc_q2', type: ComponentType.Qubit, position: { x: 50, y: 400 }, data: { label: 'ancilla |0⟩' } },
      { id: 'bfc_cnot1', type: ComponentType.CNOT, position: { x: 250, y: 175 }, data: { label: 'Encode', handles: cnotHandles } },
      { id: 'bfc_cnot2', type: ComponentType.CNOT, position: { x: 400, y: 250 }, data: { label: 'Encode', handles: cnotHandles } },
      { id: 'bfc_error', type: ComponentType.PauliX, position: { x: 550, y: 250 }, data: { label: 'خطای Bit-Flip' } },
      { id: 'bfc_m0', type: ComponentType.Measure, position: { x: 700, y: 100 }, data: { label: 'اندازه‌گیری' } },
      { id: 'bfc_m1', type: ComponentType.Measure, position: { x: 700, y: 250 }, data: { label: 'اندازه‌گیری' } },
      { id: 'bfc_m2', type: ComponentType.Measure, position: { x: 700, y: 400 }, data: { label: 'اندازه‌گیری' } }
    ],
    edges: [
      // Encoding
      { id: 'e_bfc1', source: 'bfc_q0', target: 'bfc_cnot1', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_bfc2', source: 'bfc_q1', target: 'bfc_cnot1', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_bfc3', source: 'bfc_cnot1', sourceHandle: 'ctl_out', target: 'bfc_cnot2', targetHandle: 'ctl_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_bfc4', source: 'bfc_q2', target: 'bfc_cnot2', targetHandle: 'tgt_in', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      // Error
      { id: 'e_bfc5', source: 'bfc_cnot1', sourceHandle: 'tgt_out', target: 'bfc_error', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      // Measurement
      { id: 'e_bfc6', source: 'bfc_cnot2', sourceHandle: 'ctl_out', target: 'bfc_m0', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_bfc7', source: 'bfc_error', target: 'bfc_m1', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } },
      { id: 'e_bfc8', source: 'bfc_cnot2', sourceHandle: 'tgt_out', target: 'bfc_m2', animated: true, data: { type: 'quantum', length: 0, attenuation: 0 } }
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
    ...bb84NoEveTemplate,
    category: "پروتکل‌های ارتباطی",
  },
  {
    ...bb84Template,
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
