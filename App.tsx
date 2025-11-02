import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowInstance,
  Position,
  NodeChange,
} from 'reactflow';

import { ComponentPalette } from './components/ComponentPalette';
import { QuantumCanvas } from './components/QuantumCanvas';
import { ControlPanel } from './components/ControlPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { StateVectorInspector } from './components/StateVectorInspector';
import { NetworkHealthPanel } from './components/NetworkHealthPanel';
import { TutorialPanel } from './components/TutorialPanel';
import { CodeModal } from './components/CodeModal';
import { generateCircuitFromPrompt, analyzeCircuitWithGemini, generateCodeFromCircuit, generateHardwareCodeFromCircuit } from './services/geminiService';
import { CircuitData, AnalysisResult, AnalysisStatus, NodeData, ComponentType, SimulationSettings, EdgeData, AnalysisMode, NetworkStats, Tutorial } from './types';
import { ToolsIcon, AnalyzeIcon, CanvasIcon, CloseIcon, ComponentsIcon, DesignIcon } from './components/icons/UIIcons';

let id = 0;
const getId = () => `dndnode_${id++}`;

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

const getDefaultParameters = (type: ComponentType): Partial<NodeData> => {
    switch (type) {
        case ComponentType.Qubit:
            return { initialState: 0, t1: 100, t2: 50 };
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
            return { role: 'generic', t1: 100, t2: 50, gateFidelity: 0.99 };
        case ComponentType.Repeater:
            return { swapFidelity: 0.95, memoryT1: 1000, memoryT2: 100 };
        case ComponentType.Measure:
            return {};
        default:
            return {};
    }
};

type CodeLanguage = 'qiskit' | 'openqasm';

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [selectedNodeForAnalysis, setSelectedNodeForAnalysis] = useState<Node<NodeData> | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>({
    shots: 1024,
    gateErrorProbability: 0,
    decoherenceStrength: 0,
    enableAdvanced: false,
    couplingMap: 'fully-connected',
    t1: 50,
    t2: 25,
    readoutError: 0.01,
  });

  const [leftPanelTab, setLeftPanelTab] = useState<'controls' | 'components'>('controls');
  const [activeMobilePanel, setActiveMobilePanel] = useState<'tools' | 'analysis' | null>(null);
  const [mobileToolsTab, setMobileToolsTab] = useState<'controls' | 'components' | 'properties'>('controls');

  // --- Code Import/Export State ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingCode, setIsExportingCode] = useState(false);
  const [exportedCode, setExportedCode] = useState<{ qiskit?: string; openqasm?: string }>({});
  const [activeCodeLanguage, setActiveCodeLanguage] = useState<CodeLanguage>('qiskit');
  const [importCode, setImportCode] = useState('');

  // --- Hardware Code Export State ---
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isExportingHardwareCode, setIsExportingHardwareCode] = useState(false);
  const [exportedHardwareCode, setExportedHardwareCode] = useState('');


  // --- Tutorial State ---
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);
  const [tutorialError, setTutorialError] = useState(false);
  const [userActionTrigger, setUserActionTrigger] = useState(0);
  
  const isTutorialModeActive = activeTutorial !== null;
  const currentStep = isTutorialModeActive ? activeTutorial.steps[currentTutorialStep] : null;

  const selectedNode = useMemo(() => nodes.find((node) => node.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.selected), [edges]);
  const hasSelection = selectedNode || selectedEdge;

  // --- Tutorial Logic ---
  const handleStartTutorial = (tutorial: Tutorial) => {
    handleClear();
    setActiveTutorial(tutorial);
    setCurrentTutorialStep(0);
    setActiveMobilePanel(null);
  };
  
  const handleExitTutorial = () => {
    setActiveTutorial(null);
    setCurrentTutorialStep(0);
    setHighlightedElementId(null);
  };

  const advanceTutorial = useCallback(() => {
    if (activeTutorial && currentTutorialStep < activeTutorial.steps.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      // Tutorial finished
      setTimeout(() => handleExitTutorial(), 3000); // give user time to read last message
    }
  }, [activeTutorial, currentTutorialStep]);

  const handleTutorialNext = () => {
      if (currentStep?.action === 'read') {
          advanceTutorial();
      }
  };

  const handleTutorialPrev = () => {
      if (currentTutorialStep > 0) {
          setCurrentTutorialStep(prev => prev - 1);
      }
  };

  const triggerUserAction = () => {
    if (isTutorialModeActive) {
      setUserActionTrigger(v => v + 1);
    }
  };

  const resolveNodeId = useCallback((selector: string, nodeList: Node<NodeData>[]): string | null => {
      if (!selector) return null;
      if (selector === 'LATEST') {
        return nodeList.length > 0 ? nodeList[nodeList.length - 1].id : null;
      }
      const parts = selector.split(':');
      if (parts.length === 2) {
        const type = parts[0] as ComponentType;
        const index = parseInt(parts[1], 10);
        const filteredNodes = nodeList
          .filter(n => n.type === type)
          .sort((a, b) => { // Sort by position to make it deterministic
            if (a.position.y !== b.position.y) {
              return a.position.y - b.position.y;
            }
            return a.position.x - b.position.x;
          });
        if (filteredNodes[index]) {
          return filteredNodes[index].id;
        }
      }
      // Fallback to finding by direct ID
      return nodeList.find(n => n.id === selector) ? selector : null;
  }, []);

  // Central tutorial validation logic
  useEffect(() => {
    if (!isTutorialModeActive || !currentStep || currentStep.action === 'read') return;

    const validate = (): boolean => {
      // Validate component drag-and-drop
      if (currentStep.action === 'drag-component' && currentStep.expectedComponents) {
        return currentStep.expectedComponents.every(expected => {
          const currentCount = nodes.filter(n => n.type === expected.type).length;
          // Stricter check: the count must be exactly what's expected for this step.
          return currentCount === expected.count;
        });
      }
      // Validate connections
      if (currentStep.action === 'connect-nodes' && currentStep.expectedConnections) {
        // Stricter check: every single expected connection must exist.
        return currentStep.expectedConnections.every(expected => {
          const sourceId = resolveNodeId(expected.source, nodes);
          const targetId = resolveNodeId(expected.target, nodes);
          if (!sourceId || !targetId) return false;
          
          return edges.some(e => 
              e.source === sourceId && 
              e.target === targetId &&
              (e.sourceHandle === expected.sourceHandle || !expected.sourceHandle) &&
              (e.targetHandle === expected.targetHandle || !expected.targetHandle)
          );
        });
      }
       // Validate parameter setting
      if (currentStep.action === 'set-parameter' && currentStep.expectedParameter) {
        const { nodeId: selector, parameter, value } = currentStep.expectedParameter;
        const nodeId = resolveNodeId(selector, nodes);
        if (!nodeId) return false;
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !parameter) return false;
        
        const currentValue = node.data[parameter];
        // Use a small tolerance for floating point comparisons
        if (typeof value === 'number') {
          return Math.abs(currentValue - value) < 0.01;
        }
        return currentValue === value;
      }
      return false; // Return false if no state-based validation matches
    };
    
    // Check if the current state satisfies the step's condition
    if (validate()) {
      advanceTutorial();
    } else if (userActionTrigger > 0) {
      // User performed an action, but it wasn't the correct one to advance.
      setTutorialError(true);
      setTimeout(() => setTutorialError(false), 500); // Reset for animation
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, isTutorialModeActive, currentStep, advanceTutorial, resolveNodeId, userActionTrigger]);
  
  // Reset user action trigger after it's been processed
  useEffect(() => {
      if (userActionTrigger > 0) {
          setUserActionTrigger(0);
      }
  }, [userActionTrigger]);


  // Effect to manage UI highlighting for tutorials
  useEffect(() => {
      if (isTutorialModeActive && currentStep) {
          setHighlightedElementId(currentStep.targetId || null);
      } else {
          setHighlightedElementId(null);
      }
  }, [isTutorialModeActive, currentStep]);

  // Remove previous highlights before applying new one
  useEffect(() => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    if (highlightedElementId) {
      setTimeout(() => {
        const element = document.getElementById(highlightedElementId);
        if (element) {
          element.classList.add('tutorial-highlight');
        }
      }, 50);
    }
  }, [highlightedElementId]);


  useEffect(() => {
    if (hasSelection) {
      if (selectedNode) setSelectedNodeForAnalysis(selectedNode);
      if (window.innerWidth < 768) { // On mobile
        setActiveMobilePanel('tools');
        setMobileToolsTab('properties');
      }
    } else {
       if (mobileToolsTab === 'properties') {
         setMobileToolsTab('controls');
       }
    }
  }, [selectedNode, selectedEdge, mobileToolsTab]);

  // Effect to calculate network health stats on the client-side
  useEffect(() => {
    const quantumEdges = edges.filter(edge => edge.data?.type === 'quantum');
    if (quantumEdges.length === 0) {
      setNetworkStats(null);
      return;
    }

    const totalLength = quantumEdges.reduce((sum, edge) => sum + (edge.data?.length || 0), 0);
    const totalAttenuation = quantumEdges.reduce((sum, edge) => sum + (edge.data?.length || 0) * (edge.data?.attenuation || 0), 0);
    
    const SPEED_OF_LIGHT_IN_FIBER_KMS = 299792.458 / 1.44; 
    const estimatedLatency = (totalLength / SPEED_OF_LIGHT_IN_FIBER_KMS) * 1000; // in ms

    const networkSurvivalProbability = quantumEdges.reduce((prod, edge) => {
      const attenuation = edge.data?.attenuation || 0;
      const length = edge.data?.length || 0;
      const survival = 10**(-(attenuation * length) / 10);
      return prod * survival;
    }, 1);

    setNetworkStats({
      totalLength,
      totalAttenuation,
      estimatedLatency,
      networkSurvivalProbability,
    });
  }, [edges]);


  const onNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    triggerUserAction();
    const selectionChange = changes.find(
      (change) => change.type === 'select' && change.selected
    );
    if (selectionChange && 'id' in selectionChange) {
      const newlySelectedNode = nodes.find(node => node.id === selectionChange.id);
      if (newlySelectedNode) {
        setSelectedNodeForAnalysis(newlySelectedNode);
      }
    }
  }, [onNodesChangeInternal, nodes]);


  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', data: { type: 'quantum', length: 10, attenuation: 0.2 } }, eds));
      triggerUserAction();
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (reactFlowInstance) {
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const data = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const newNode: Node<NodeData> = {
          id: getId(),
          type: data.nodeType,
          position,
          data: { 
            label: `${data.label}`,
            ...getDefaultParameters(data.nodeType as ComponentType),
            ...(data.nodeType === ComponentType.CNOT && { handles: cnotHandles }),
            ...(data.nodeType === ComponentType.Toffoli && { handles: toffoliHandles })
          },
        };
        setNodes((nds) => nds.concat(newNode));
        triggerUserAction();
      }
    },
    [reactFlowInstance, setNodes]
  );

  const handleUpdateNode = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const newData = { ...node.data, ...data };
          return { ...node, data: newData };
        }
        return node;
      })
    );
    triggerUserAction();
  }, [setNodes]);

  const handleUpdateEdge = useCallback((id: string, data: Partial<EdgeData>) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          const newData = { ...edge.data, ...data };
          return { ...edge, data: newData };
        }
        return edge;
      })
    );
    triggerUserAction();
  }, [setEdges]);

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setAnalysisResult(null);
    setAnalysisStatus('idle');
    setSelectedNodeForAnalysis(null);
    setActiveMobilePanel(null);
    if (isTutorialModeActive) {
        handleExitTutorial();
    }
  };

  const handleLoadTemplate = (circuit: CircuitData) => {
    handleClear();
    setTimeout(() => {
        setNodes(circuit.nodes);
        setEdges(circuit.edges);
    }, 50);
  };

  const handleGenerateCircuit = async (prompt: string, fromCode: boolean = false) => {
    handleClear();
    setIsGenerating(true);
    try {
      const circuit: CircuitData = await generateCircuitFromPrompt(prompt, fromCode);
      setNodes(circuit.nodes || []);
      setEdges(circuit.edges || []);
    } catch (error) {
      console.error(error);
      // You might want to show an error to the user here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async (mode: AnalysisMode) => {
    if (isTutorialModeActive && currentStep?.action === 'click-element' && currentStep.targetId?.startsWith('analysis-button-group')) {
        if (currentStep.expectedClickValue && mode === currentStep.expectedClickValue) {
            advanceTutorial();
        } else {
            triggerUserAction(); // This will trigger error shake
        }
    }
    if (nodes.length === 0) {
      alert("لطفاً ابتدا یک مدار بسازید یا تولید کنید.");
      return;
    }
    setAnalysisStatus('loading');
    setAnalysisResult(null);
    setSelectedNodeForAnalysis(null);
    setActiveMobilePanel('analysis');
    try {
      const circuitJson = JSON.stringify({ nodes, edges });
      const result = await analyzeCircuitWithGemini(circuitJson, simulationSettings, mode);
      setAnalysisResult(result);
      setAnalysisStatus('success');
    } catch(error) {
      console.error(error);
      setAnalysisStatus('error');
    }
  };

  // --- Code Import/Export Handlers ---
  const handleExportCode = useCallback(async (language: CodeLanguage) => {
      if (nodes.length === 0) {
          alert("برای خروجی گرفتن ابتدا یک مدار بسازید.");
          return;
      }
      if (exportedCode[language]) {
          setActiveCodeLanguage(language);
          return; // Already generated
      }
      setIsExportingCode(true);
      setActiveCodeLanguage(language);
      try {
          const simplifiedCircuit = {
              nodes: nodes.map(({ id, type, data }) => ({ id, type, data: { label: data.label, angle: data.angle } })),
              edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({ id, source, target, sourceHandle, targetHandle })),
          };
          const code = await generateCodeFromCircuit(JSON.stringify(simplifiedCircuit), language);
          setExportedCode(prev => ({ ...prev, [language]: code }));
      } catch (error) {
          console.error(`Failed to export to ${language}`, error);
          alert(`خطا در تولید کد ${language}.`);
      } finally {
          setIsExportingCode(false);
      }
  }, [nodes, edges, exportedCode]);
  
  const handleOpenExportModal = () => {
    setExportedCode({}); // Clear previous code
    setIsExportModalOpen(true);
    handleExportCode('qiskit'); // Generate Qiskit code by default
  };
  
  const handleImportFromCode = () => {
      if (!importCode.trim()) return;
      setIsImportModalOpen(false);
      handleGenerateCircuit(importCode, true);
      setImportCode('');
  };

  const handleCopyToClipboard = (code: string | undefined) => {
    if (code) {
      navigator.clipboard.writeText(code);
      // Maybe show a small "Copied!" message
    }
  };

    // --- Hardware Code Export Handler ---
  const handleOpenHardwareModal = useCallback(async () => {
    if (nodes.length === 0) {
        alert("برای خروجی گرفتن ابتدا یک مدار بسازید.");
        return;
    }
    setIsHardwareModalOpen(true);
    setIsExportingHardwareCode(true);
    setExportedHardwareCode(''); // Clear previous
    try {
        const simplifiedCircuit = {
            nodes: nodes.map(({ id, type, data }) => ({ id, type, data: { label: data.label } })),
            edges: edges.map(({ id, source, target }) => ({ id, source, target })),
        };
        const code = await generateHardwareCodeFromCircuit(JSON.stringify(simplifiedCircuit), 'verilog');
        setExportedHardwareCode(code);
    } catch (error) {
        console.error(`Failed to export to verilog`, error);
        alert(`خطا در تولید کد Verilog.`);
    } finally {
        setIsExportingHardwareCode(false);
    }
  }, [nodes, edges]);


  return (
    <main className="h-screen w-screen bg-transparent text-white overflow-hidden" dir="rtl">
        <div className="flex h-full">

            {/* --- Left Sidebar (Desktop) --- */}
            <aside className="hidden md:flex flex-col w-80 lg:w-96 bg-gray-900/60 backdrop-blur-xl border-l border-white/10 shadow-2xl">
                <div className="p-4 flex-shrink-0 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-white">شبیه‌ساز شبکه کوانتومی</h1>
                    <p className="text-sm text-cyan-300">با قدرت هوش مصنوعی Gemini</p>
                </div>
                <div className="flex-shrink-0 flex border-b border-white/10">
                    <button onClick={() => setLeftPanelTab('controls')} className={`flex-1 p-3 text-sm font-semibold transition-colors focus:outline-none ${leftPanelTab === 'controls' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-white/5'}`}>
                        ابزارهای طراحی
                    </button>
                    <button onClick={() => setLeftPanelTab('components')} className={`flex-1 p-3 text-sm font-semibold transition-colors focus:outline-none ${leftPanelTab === 'components' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-white/5'}`}>
                        قطعات
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {leftPanelTab === 'controls' ? (
                        <ControlPanel 
                            onGenerate={(p) => handleGenerateCircuit(p, false)}
                            isGenerating={isGenerating}
                            onClear={handleClear}
                            onLoadTemplate={handleLoadTemplate}
                            settings={simulationSettings}
                            onSettingsChange={setSimulationSettings}
                            onStartTutorial={handleStartTutorial}
                            onImportCode={() => setIsImportModalOpen(true)}
                            onExportCode={handleOpenExportModal}
                            onExportHardwareCode={handleOpenHardwareModal}
                        />
                    ) : (
                        <div id="component-palette-wrapper">
                            <ComponentPalette />
                        </div>
                    )}
                </div>
            </aside>

            {/* --- Main Area --- */}
            <div className="flex-grow flex flex-col h-full min-w-0 md:pb-0 relative">
                {/* Mobile Header */}
                <header className="absolute top-0 right-0 left-0 p-4 z-30 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm md:hidden">
                    <h1 className="text-xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,255,255,0.5)]">
                        شبیه‌ساز کوانتومی
                    </h1>
                    {activeMobilePanel && (
                        <button onClick={() => setActiveMobilePanel(null)} className="text-white p-1 rounded-full bg-gray-800/50">
                            <CloseIcon />
                        </button>
                    )}
                </header>

                <div className="pt-16 md:pt-0 flex-grow flex flex-col min-h-0">
                    <StateVectorInspector 
                        selectedNode={selectedNodeForAnalysis}
                        simulationResult={analysisResult}
                    />
                    <NetworkHealthPanel stats={networkStats} />
                    <div className="flex-grow min-h-0 relative">
                        {isTutorialModeActive && activeTutorial && (
                            <TutorialPanel
                                tutorial={activeTutorial}
                                currentStepIndex={currentTutorialStep}
                                onNext={handleTutorialNext}
                                onPrev={handleTutorialPrev}
                                onExit={handleExitTutorial}
                                isError={tutorialError}
                            />
                        )}
                        <QuantumCanvas 
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onInit={setReactFlowInstance}
                        />
                    </div>
                </div>

                 <div className={`md:hidden absolute bottom-16 left-0 right-0 z-20 h-[calc(100%-4rem-4rem)] transition-transform duration-300 ${activeMobilePanel === 'analysis' ? 'translate-y-0' : 'translate-y-full'}`}>
                    <AnalysisPanel 
                        onAnalyze={handleAnalyze}
                        analysisStatus={analysisStatus}
                        analysisResult={analysisResult}
                        />
                </div>
                
                <div className="hidden md:block">
                    <AnalysisPanel 
                        onAnalyze={handleAnalyze}
                        analysisStatus={analysisStatus}
                        analysisResult={analysisResult}
                    />
                </div>
            </div>
            
            {/* --- Right Sidebar (Desktop) --- */}
            <aside id="properties-panel-wrapper" className={`hidden md:flex flex-col bg-gray-900/60 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${hasSelection ? 'w-72' : 'w-0'}`}>
              {(selectedNode || selectedEdge) && (
                <PropertiesPanel 
                  selectedNode={selectedNode} 
                  selectedEdge={selectedEdge}
                  onUpdateNode={handleUpdateNode}
                  onUpdateEdge={handleUpdateEdge}
                  simulationResult={analysisResult}
                />
              )}
            </aside>
            
            {/* --- Mobile Tools/Properties Panel --- */}
            <div className={`md:hidden absolute inset-0 pt-16 z-20 bg-gray-900/80 backdrop-blur-sm transition-transform duration-300 ${activeMobilePanel === 'tools' ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full w-full overflow-hidden">
                    <div className="flex-shrink-0 border-b border-white/10">
                        <nav className="flex">
                            <button onClick={() => setMobileToolsTab('controls')} className={`flex-1 p-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mobileToolsTab === 'controls' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'}`}><DesignIcon /> طراحی</button>
                            <button onClick={() => setMobileToolsTab('components')} className={`flex-1 p-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mobileToolsTab === 'components' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'}`}><ComponentsIcon /> قطعات</button>
                            {hasSelection && <button onClick={() => setMobileToolsTab('properties')} className={`flex-1 p-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mobileToolsTab === 'properties' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400'}`}><ToolsIcon /> خصوصیات</button>}
                        </nav>
                    </div>
                    <div className="flex-grow overflow-y-auto" id="mobile-component-palette-wrapper">
                      {mobileToolsTab === 'controls' && <ControlPanel onGenerate={(p) => {handleGenerateCircuit(p); setActiveMobilePanel(null)}} isGenerating={isGenerating} onClear={() => {handleClear(); setActiveMobilePanel(null)}} onLoadTemplate={(t) => {handleLoadTemplate(t); setActiveMobilePanel(null)}} settings={simulationSettings} onSettingsChange={setSimulationSettings} onStartTutorial={(t) => {handleStartTutorial(t); setActiveMobilePanel(null)}} onImportCode={() => {setIsImportModalOpen(true); setActiveMobilePanel(null)}} onExportCode={() => {handleOpenExportModal(); setActiveMobilePanel(null)}} onExportHardwareCode={() => {handleOpenHardwareModal(); setActiveMobilePanel(null)}} />}
                      {mobileToolsTab === 'components' && <ComponentPalette />}
                      {mobileToolsTab === 'properties' && (selectedNode || selectedEdge) && <PropertiesPanel selectedNode={selectedNode} selectedEdge={selectedEdge} onUpdateNode={handleUpdateNode} onUpdateEdge={handleUpdateEdge} simulationResult={analysisResult} />}
                    </div>
                </div>
            </div>

            {/* Mobile Toolbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center bg-gray-900/80 backdrop-blur-sm border-t border-white/10 p-2 z-30">
                <button onClick={() => { setActiveMobilePanel('tools'); if(!hasSelection) setMobileToolsTab('controls'); }} className={`flex flex-col items-center transition-colors w-1/3 ${activeMobilePanel === 'tools' ? 'text-cyan-300' : 'text-gray-400 hover:text-white'}`}>
                    <ToolsIcon />
                    <span className="text-xs mt-1">ابزارها</span>
                </button>
                <button onClick={() => setActiveMobilePanel(null)} className={`flex flex-col items-center transition-colors w-1/3 ${!activeMobilePanel ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                    <CanvasIcon />
                    <span className="text-xs mt-1">بوم</span>
                </button>
                <button onClick={() => setActiveMobilePanel('analysis')} className={`flex flex-col items-center transition-colors w-1/3 ${activeMobilePanel === 'analysis' ? 'text-cyan-300' : 'text-gray-400 hover:text-white'}`}>
                    <AnalyzeIcon />
                    <span className="text-xs mt-1">تحلیل</span>
                </button>
            </div>
        </div>

        {/* Code Modals */}
        <CodeModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="ورود مدار از کد">
            <div className="flex flex-col h-full">
              <p className="text-sm text-gray-400 mb-3">کد Qiskit یا OpenQASM 2.0 را اینجا وارد کنید.</p>
              <textarea
                  className="w-full flex-grow p-2 bg-black/30 border border-white/10 rounded-md text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-gray-500 resize-none font-mono"
                  placeholder={`from qiskit import QuantumCircuit\n\n# Create a new circuit with two qubits\nqc = QuantumCircuit(2)\n\nqc.h(0)\nqc.cx(0, 1)\n\nprint(qc)`}
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  disabled={isGenerating}
              />
              <button
                  onClick={handleImportFromCode}
                  disabled={isGenerating || !importCode.trim()}
                  className="mt-4 w-full bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
              >
                  {isGenerating ? 'در حال ساخت...' : 'ساخت مدار از کد'}
              </button>
            </div>
        </CodeModal>

        <CodeModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="خروجی مدار به کد کوانتومی">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 flex border-b border-white/20 mb-3">
                  <button onClick={() => handleExportCode('qiskit')} className={`flex-1 p-3 text-sm font-semibold transition-colors focus:outline-none ${activeCodeLanguage === 'qiskit' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5'}`}>Qiskit</button>
                  <button onClick={() => handleExportCode('openqasm')} className={`flex-1 p-3 text-sm font-semibold transition-colors focus:outline-none ${activeCodeLanguage === 'openqasm' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:bg-white/5'}`}>OpenQASM 2.0</button>
              </div>
              <div className="flex-grow bg-black/30 rounded-md p-1 relative">
                {isExportingCode ? (
                   <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                   </div>
                ) : (
                    <pre className="h-full w-full overflow-auto">
                        <code className="text-sm font-mono text-gray-200 whitespace-pre">
                            {exportedCode[activeCodeLanguage] || `کدی برای ${activeCodeLanguage} یافت نشد.`}
                        </code>
                    </pre>
                )}
              </div>
              <button
                  onClick={() => handleCopyToClipboard(exportedCode[activeCodeLanguage])}
                  disabled={isExportingCode || !exportedCode[activeCodeLanguage]}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
              >
                  کپی در کلیپ‌بورد
              </button>
            </div>
        </CodeModal>

        <CodeModal isOpen={isHardwareModalOpen} onClose={() => setIsHardwareModalOpen(false)} title="خروجی کد سخت‌افزار (Verilog)">
            <div className="flex flex-col h-full">
              <p className="text-sm text-gray-400 mb-3 flex-shrink-0">این کد Verilog یک کنترلر پایه BB84 را برای پیاده‌سازی روی FPGA شبیه‌سازی می‌کند.</p>
              <div className="flex-grow bg-black/30 rounded-md p-1 relative">
                {isExportingHardwareCode ? (
                   <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                   </div>
                ) : (
                    <pre className="h-full w-full overflow-auto">
                        <code className="text-sm font-mono text-gray-200 whitespace-pre">
                            {exportedHardwareCode || `کدی برای Verilog یافت نشد. آیا مدار شما یک پروتکل QKD است؟`}
                        </code>
                    </pre>
                )}
              </div>
              <button
                  onClick={() => handleCopyToClipboard(exportedHardwareCode)}
                  disabled={isExportingHardwareCode || !exportedHardwareCode}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
              >
                  کپی در کلیپ‌بورد
              </button>
            </div>
        </CodeModal>
    </main>
  );
};

export default App;