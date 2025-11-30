import { QuantumComponent, ComponentType, NodeData } from './types';

export const QUANTUM_COMPONENTS: QuantumComponent[] = [
  // Network Nodes
  {
    id: 'endNode',
    type: ComponentType.EndNode,
    label: 'گره پایانی',
    description: 'یک ایستگاه کاربر در شبکه (مانند آلیس یا باب).',
    category: 'گره‌های شبکه'
  },
  {
    id: 'repeater',
    type: ComponentType.Repeater,
    label: 'تکرارگر کوانتومی',
    description: 'با تعویض درهم‌تنیدگی ارتباط را گسترش می‌دهد.',
    category: 'گره‌های شبکه'
  },
  {
    id: 'eavesdropper',
    type: ComponentType.Eavesdropper,
    label: 'شنودگر (Eve)',
    description: 'یک کانال کوانتومی را برای حمله شنود می‌کند.',
    category: 'گره‌های شبکه'
  },
  {
    id: 'phaseModulator',
    type: ComponentType.PhaseModulator,
    label: 'مدولاتور فاز',
    description: 'فاز یک فوتون را تغییر می‌دهد (برای کدگذاری فاز).',
    category: 'گره‌های شبکه'
  },
  {
    id: 'beamSplitter',
    type: ComponentType.BeamSplitter,
    label: 'جداکننده پرتو',
    description: 'پرتو نور را تقسیم می‌کند؛ برای تداخل‌سنجی استفاده می‌شود.',
    category: 'گره‌های شبکه'
  },
  {
    id: 'polarizationRotator',
    type: ComponentType.PolarizationRotator,
    label: 'چرخاننده قطبش',
    description: 'زوایه قطبش یک فوتون را تغییر می‌دهد.',
    category: 'گره‌های شبکه'
  },
  {
    id: 'interferometer',
    type: ComponentType.Interferometer,
    label: 'تداخل‌سنج',
    description: 'یک دستگاه برای اندازه‌گیری اختلاف فاز.',
    category: 'گره‌های شبکه'
  },

  // Circuit Components
  {
    id: 'qubit',
    type: ComponentType.Qubit,
    label: 'کیوبیت',
    description: 'واحد پایه اطلاعات کوانتومی',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'hadamard',
    type: ComponentType.Hadamard,
    label: 'گیت هادامارد',
    description: 'یک کیوبیت را در حالت برهم‌نهی قرار می‌دهد',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'x',
    type: ComponentType.PauliX,
    label: 'گیت X (NOT)',
    description: 'حالت کیوبیت را معکوس می‌کند',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'cnot',
    type: ComponentType.CNOT,
    label: 'گیت CNOT',
    description: 'گیت NOT کنترل‌شده برای درهم‌تنیدگی',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'toffoli',
    type: ComponentType.Toffoli,
    label: 'گیت Toffoli',
    description: 'گیت NOT کنترل‌شده-کنترل‌شده (CCNOT)',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'phase',
    type: ComponentType.Phase,
    label: 'گیت فاز (S)',
    description: 'یک شیفت فاز π/2 اعمال می‌کند',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'rz',
    type: ComponentType.Rz,
    label: 'گیت چرخش Rz',
    description: 'کیوبیت را حول محور Z می‌چرخاند',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'measure',
    type: ComponentType.Measure,
    label: 'اندازه‌گیری',
    description: 'حالت یک کیوبیت را اندازه‌گیری می‌کند',
    category: 'کامپوننت‌های مداری'
  },
  {
    id: 'custom',
    type: ComponentType.Custom,
    label: 'سفارشی',
    description: 'یک گیت یا عملیات کوانتومی تعریف شده توسط کاربر.',
    category: 'کامپوننت‌های مداری'
  },
  // New Photonic Components
  {
    id: 'waveplate',
    type: ComponentType.Waveplate,
    label: 'Waveplate',
    description: 'شیفت فاز را بین قطبش‌ها اعمال می‌کند.',
    category: 'کامپوننت‌های فوتونیک'
  },
  {
    id: 'polarizer',
    type: ComponentType.Polarizer,
    label: 'Polarizer',
    description: 'فوتون‌ها را در یک جهت قطبش فیلتر می‌کند.',
    category: 'کامپوننت‌های فوتونیک'
  },
  {
    id: 'pockelsCell',
    type: ComponentType.PockelsCell,
    label: 'Pockels Cell',
    description: 'قطبش را با اعمال ولتاژ تغییر می‌دهد.',
    category: 'کامپوننت‌های فوتونیک'
  },
  {
    id: 'eom',
    type: ComponentType.EOM,
    label: 'EOM (مدولاتور الکترو-اپتیک)',
    description: 'فاز یا دامنه را با سیگنال الکتریکی مدوله می‌کند.',
    category: 'کامپوننت‌های فوتونیک'
  },
];

export const getDefaultParameters = (type: ComponentType): Partial<NodeData> => {
    switch (type) {
        case ComponentType.Qubit:
            return { initialState: 0, t1: 100, t2: 50, amplitudeDampingRate: 0.001, phaseDampingRate: 0.001 };
        case ComponentType.Hadamard:
        case ComponentType.PauliX:
        case ComponentType.Phase:
        case ComponentType.CNOT:
        case ComponentType.Toffoli:
            return { gateFidelity: 0.999, gateTime: 10 };
        case ComponentType.Rz:
            return { angle: Math.PI / 2, gateFidelity: 0.999, gateTime: 10 };
        case ComponentType.Eavesdropper:
            return { attackStrategy: 'intercept_resend', basisChoiceBias: 0.5 };
        case ComponentType.EndNode:
            return { role: 'generic', t1: 100, t2: 50, gateFidelity: 0.99, basisEncoding: 'polarization', amplitudeDampingRate: 0.001, phaseDampingRate: 0.001 };
        case ComponentType.Repeater:
            return { swapFidelity: 0.95, memoryT1: 1000, memoryT2: 100, amplitudeDampingRate: 0.001, phaseDampingRate: 0.001, storageTime: 100, storageEfficiency: 0.99, memoryNoiseType: 'coherent_dephasing' };
        case ComponentType.Measure:
            return {};
        case ComponentType.Source:
            return { photonType: 'single', wavelength: 1550, purity: 0.98, basisEncoding: 'polarization', photonStatistics: 'poisson', indistinguishability: 0.99, spectralPurity: 0.99, repetitionRate: 100 };
        case ComponentType.Detector:
            return { efficiency: 0.9, darkCounts: 10, detectorType: 'polarization', deadTime: 100, afterpulsingProbability: 0.005, crosstalkProbability: 0.01 };
        case ComponentType.PhaseModulator:
            return { phaseShift: 0, gateFidelity: 0.99 };
        case ComponentType.BeamSplitter:
            return { gateFidelity: 0.99 };
        case ComponentType.PolarizationRotator:
            return { polarizationRotatorAngle: 0, gateFidelity: 0.99 };
        case ComponentType.Interferometer:
            return { interferometerArmLengthDifference: 10, gateFidelity: 0.98 };
        case ComponentType.Waveplate:
            return { retardance: 0.5 * Math.PI, fastAxisAngle: 0, gateFidelity: 0.99 }; // Half-wave plate by default (pi/2 retardance in Qiskit conventions)
        case ComponentType.Polarizer:
            return { extinctionRatio: 1000, transmissionAxisAngle: 0, gateFidelity: 0.99 };
        case ComponentType.PockelsCell:
            return { voltage: 0, halfWaveVoltage: 100, gateFidelity: 0.99 };
        case ComponentType.EOM:
            return { modulationIndex: 0.5, modulationFrequency: 1e9, gateFidelity: 0.99 }; // 1 GHz
        case ComponentType.Custom:
            return { label: 'گیت سفارشی', numQubits: 1, customGateMatrix: '[[[1,0],[0,0]],[[0,0],[1,0]]]', customNoiseModel: 'None', customDescription: 'A custom quantum gate acting on 1 qubit. Default is Identity.' };
        default:
            return {};
    }
};