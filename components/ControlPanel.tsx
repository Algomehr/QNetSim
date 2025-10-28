import React, { useState } from 'react';
import { CircuitData, SimulationSettings, CouplingMap, CircuitTemplate, Tutorial } from '../types';
import { CIRCUIT_TEMPLATES } from '../CircuitTemplates';
import { TUTORIALS } from '../tutorials';
import { MagicWandIcon, ClearIcon, CodeIcon } from './icons/UIIcons';

interface ControlPanelProps {
  onGenerate: (prompt: string) => void;
  onClear: () => void;
  onLoadTemplate: (circuit: CircuitData) => void;
  onSettingsChange: (settings: SimulationSettings) => void;
  onStartTutorial: (tutorial: Tutorial) => void;
  onImportCode: () => void;
  onExportCode: () => void;
  isGenerating: boolean;
  settings: SimulationSettings;
}

const groupedTemplates = CIRCUIT_TEMPLATES.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, CircuitTemplate[]>);

const groupedTutorials = TUTORIALS.reduce((acc, tutorial) => {
  if (!acc[tutorial.category]) {
    acc[tutorial.category] = [];
  }
  acc[tutorial.category].push(tutorial);
  return acc;
}, {} as Record<string, Tutorial[]>);


export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerate, 
  onClear, 
  onLoadTemplate,
  onSettingsChange,
  onStartTutorial,
  onImportCode,
  onExportCode,
  isGenerating, 
  settings
}) => {
  const [prompt, setPrompt] = useState<string>('');
  
  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleSettingChange = (field: keyof SimulationSettings, value: any) => {
    onSettingsChange({ ...settings, [field]: value });
  };
  
  return (
    <div className="p-4">
      <div className="flex-grow flex flex-col divide-y divide-white/10">
          
          {/* AI Assistant Section */}
          <div className="pb-4">
            <h3 className="font-semibold text-gray-200 mb-2 text-base flex items-center gap-2"><MagicWandIcon /> دستیار هوش مصنوعی Gemini</h3>
            <p className="text-xs text-gray-400 mb-3">یک پروتکل یا مدار را توصیف کنید تا Gemini آن را برای شما بسازد.</p>
            <textarea
              className="w-full h-24 p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500 resize-none backdrop-blur-sm"
              placeholder="مثال: یک مدار برای آماده‌سازی حالت بِل بساز"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ساخت...
                </>
              ) : "ساخت مدار"}
            </button>
          </div>
          
          {/* Simulation Settings Section */}
          <div className="py-4">
              <h3 className="font-semibold text-gray-200 mb-3 text-base">تنظیمات شبیه‌سازی</h3>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                      تعداد تکرار (Shots): {settings.shots}
                  </label>
                  <input
                      type="range" min="1" max="8192" step="1" value={settings.shots}
                      onChange={(e) => handleSettingChange('shots', parseInt(e.target.value, 10))}
                  />
              </div>
          </div>

          {/* Noise Simulation Section */}
          <div className="py-4">
              <h3 className="font-semibold text-gray-200 mb-3 text-base">شبیه‌سازی نویز ساده</h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                          خطای گیت ({ (settings.gateErrorProbability * 100).toFixed(1) }%)
                      </label>
                      <input type="range" min="0" max="5" step="0.1" value={settings.gateErrorProbability * 100}
                          onChange={(e) => handleSettingChange('gateErrorProbability', parseFloat(e.target.value) / 100)}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                          قدرت ناهمدوسی ({ (settings.decoherenceStrength * 100).toFixed(1) }%)
                      </label>
                      <input type="range" min="0" max="10" step="0.1" value={settings.decoherenceStrength * 100}
                          onChange={(e) => handleSettingChange('decoherenceStrength', parseFloat(e.target.value) / 100)}
                      />
                  </div>
              </div>
          </div>

          {/* Advanced Hardware Profile Section */}
          <details className="py-4 group">
            <summary className="font-semibold text-gray-200 text-base cursor-pointer list-none flex justify-between items-center">
                پروفایل سخت‌افزار پیشرفته
                <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer"
                            checked={settings.enableAdvanced}
                            onChange={(e) => handleSettingChange('enableAdvanced', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                    <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
                </div>
            </summary>
            <div className={`mt-4 space-y-4 transition-opacity ${settings.enableAdvanced ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">نقشه اتصال (Coupling Map)</label>
                    <select value={settings.couplingMap} onChange={(e) => handleSettingChange('couplingMap', e.target.value as CouplingMap)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none">
                        <option value="fully-connected">اتصال کامل (ایده‌آل)</option>
                        <option value="linear-chain">زنجیره خطی</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" title="زمان آسایش - میانگین عمر حالت |1⟩">
                        زمان T1 (میکروثانیه): {settings.t1}
                    </label>
                     <input type="range" min="1" max="500" step="1" value={settings.t1}
                          onChange={(e) => handleSettingChange('t1', parseInt(e.target.value, 10))}
                      />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" title="زمان ناهمدوسی فاز - از دست رفتن اطلاعات فاز">
                        زمان T2 (میکروثانیه): {settings.t2}
                    </label>
                     <input type="range" min="1" max={settings.t1 * 2} step="1" value={settings.t2}
                          onChange={(e) => handleSettingChange('t2', parseInt(e.target.value, 10))}
                      />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" title="احتمال خطا در اندازه‌گیری نهایی هر کیوبیت">
                        خطای خوانش ({ (settings.readoutError * 100).toFixed(1) }%)
                    </label>
                    <input type="range" min="0" max="10" step="0.1" value={settings.readoutError * 100}
                        onChange={(e) => handleSettingChange('readoutError', parseFloat(e.target.value) / 100)}
                    />
                </div>
            </div>
          </details>

          {/* Developer Tools Section */}
          <details className="py-4 group">
            <summary className="font-semibold text-gray-200 text-base cursor-pointer list-none flex justify-between items-center">
                <div className="flex items-center gap-2"><CodeIcon /> ابزارهای برنامه‌نویس</div>
                <span className="text-cyan-400 group-open:rotate-90 transition-transform">›</span>
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    onClick={onExportCode}
                    className="w-full text-center p-3 bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                >
                    <p className="font-semibold text-indigo-300">خروجی به کد</p>
                </button>
                <button
                    onClick={onImportCode}
                    className="w-full text-center p-3 bg-gray-700/50 border border-gray-600 rounded-lg transition-all duration-200 hover:bg-sky-500/20 hover:border-sky-400/50"
                >
                    <p className="font-semibold text-sky-300">ورود از کد</p>
                </button>
            </div>
          </details>

          {/* Guided Learning Section */}
          <div className="py-4">
            <h3 className="font-semibold text-gray-200 mb-3 text-base">یادگیری هدایت‌شده</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {Object.entries(groupedTutorials).map(([category, tutorials]) => (
                <div key={category}>
                    <h4 className="font-semibold text-gray-400 mb-2 text-sm px-1">{category}</h4>
                    <div className="space-y-2">
                        {tutorials.map(tutorial => (
                            <button 
                              key={tutorial.id}
                              onClick={() => onStartTutorial(tutorial)}
                              className="w-full text-right p-3 bg-white/5 border border-white/10 rounded-lg transition-all duration-200 hover:bg-sky-500/20 hover:border-sky-400/50"
                            >
                              <p className="font-semibold text-sky-300">{tutorial.name}</p>
                              <p className="text-xs text-gray-400">{tutorial.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
              ))}
            </div>
          </div>


          {/* Circuit Library Section */}
          <div className="py-4">
            <h3 className="font-semibold text-gray-200 mb-3 text-base">کتابخانه مدارها</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category}>
                    <h4 className="font-semibold text-gray-400 mb-2 text-sm px-1">{category}</h4>
                    <div className="space-y-2">
                        {templates.map(template => (
                            <button 
                              key={template.name}
                              onClick={() => onLoadTemplate(template.circuit)}
                              className="w-full text-right p-3 bg-white/5 border border-white/10 rounded-lg transition-all duration-200 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                            >
                              <p className="font-semibold text-indigo-300">{template.name}</p>
                              <p className="text-xs text-gray-400">{template.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="pt-4">
            <h3 className="font-semibold text-gray-200 mb-3 text-base">عملیات</h3>
             <button 
                  onClick={onClear}
                  className="w-full bg-red-700/80 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  <ClearIcon /> پاک کردن بوم
            </button>
          </div>
      </div>
    </div>
  );
};