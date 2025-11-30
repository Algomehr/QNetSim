import React from 'react';
import { NetworkStats } from '../types';
import { AttenuationIcon, LatencyIcon, ProbabilityIcon, LengthIcon, DispersionIcon, PDLIcon, ThermalNoiseIcon, TurbulenceIcon, FadingIcon, BandwidthIcon, ClassicalLatencyIcon } from './icons/UIIcons';

interface NetworkHealthPanelProps {
  stats: NetworkStats | null;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; }> = ({ icon, label, value, color }) => (
  <div className="flex items-center space-x-3 space-x-reverse bg-black/20 p-2 rounded-lg flex-1 min-w-[160px]">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        {icon}
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

export const NetworkHealthPanel: React.FC<NetworkHealthPanelProps> = ({ stats }) => {
  if (!stats) {
    return (
        <div className="flex-shrink-0 bg-gray-900/40 border-b border-white/10 p-2 text-center">
            <p className="text-xs text-gray-500">برای مشاهده آمار سلامت شبکه، یک کانال کوانتومی اضافه کنید.</p>
        </div>
    );
  }
  
  const survivalProbability = stats.networkSurvivalProbability * 100;
  let probabilityColor = 'bg-green-500/30 text-green-300';
  if (survivalProbability < 50) probabilityColor = 'bg-yellow-500/30 text-yellow-300';
  if (survivalProbability < 10) probabilityColor = 'bg-red-500/30 text-red-300';


  return (
    <div className="flex-shrink-0 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 p-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <StatCard 
            icon={<LengthIcon />} 
            label="طول کل کانال‌ها" 
            value={`${stats.totalLength.toFixed(1)} km`}
            color="bg-blue-500/30 text-blue-300"
        />
        <StatCard 
            icon={<AttenuationIcon />} 
            label="تضعیف کل" 
            value={`${stats.totalAttenuation.toFixed(2)} dB`}
            color="bg-orange-500/30 text-orange-300"
        />
        <StatCard 
            icon={<DispersionIcon />} 
            label="دیسپرسیون کل" 
            value={`${stats.totalDispersion?.toFixed(2) ?? 'N/A'} ps/nm`}
            color="bg-teal-500/30 text-teal-300"
        />
        <StatCard 
            icon={<PDLIcon />} 
            label="اتلاف وابسته به قطبش" 
            value={`${stats.totalPDL?.toFixed(2) ?? 'N/A'} dB`}
            color="bg-purple-500/30 text-purple-300"
        />
        <StatCard 
            icon={<ThermalNoiseIcon />} 
            label="نویز حرارتی کل" 
            value={`${stats.totalThermalNoise?.toExponential(2) ?? 'N/A'} W`}
            color="bg-yellow-500/30 text-yellow-300"
        />
        <StatCard 
            icon={<TurbulenceIcon />} 
            label="تأثیر تلاطم فضای آزاد" 
            value={`${stats.totalFreeSpaceTurbulenceImpact?.toFixed(2) ?? 'N/A'} Factor`}
            color="bg-amber-500/30 text-amber-300"
        />
        <StatCard 
            icon={<FadingIcon />} 
            label="تأثیر فیدینگ فضای آزاد" 
            value={`${stats.totalFreeSpaceFadingImpact?.toFixed(2) ?? 'N/A'} Factor`}
            color="bg-red-500/30 text-red-300"
        />
        <StatCard 
            icon={<BandwidthIcon />} 
            label="پهنای باند کلاسیک" 
            value={`${stats.totalClassicalBandwidth?.toFixed(0) ?? 'N/A'} Mbps`}
            color="bg-sky-500/30 text-sky-300"
        />
        <StatCard 
            icon={<ClassicalLatencyIcon />} 
            label="تاخیر کلاسیک" 
            value={`${stats.totalClassicalLatency?.toFixed(0) ?? 'N/A'} ms`}
            color="bg-pink-500/30 text-pink-300"
        />
        <StatCard 
            icon={<LatencyIcon />} 
            label="تخمین تأخیر" 
            value={`${stats.estimatedLatency.toFixed(3)} ms`}
            color="bg-indigo-500/30 text-indigo-300"
        />
        <StatCard 
            icon={<ProbabilityIcon />} 
            label="احتمال بقای سیگنال" 
            value={`${survivalProbability.toExponential(2)} %`}
            color={probabilityColor}
        />
      </div>
    </div>
  );
};