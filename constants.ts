import { QuantumComponent, ComponentType } from './types';

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
];