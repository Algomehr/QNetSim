import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SimulationSettings, AnalysisMode, ErrorContribution, ParameterSweepSettings, SweepResult } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const circuitSchema = {
    type: Type.OBJECT,
    properties: {
        nodes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Should be one of: 'qubit', 'hadamard', 'cnot', 'measure', 'phase', 'rz', 'x', 'toffoli', 'eavesdropper', 'endNode', 'repeater', 'phaseModulator', 'beamSplitter', 'polarizationRotator', 'interferometer', 'waveplate', 'polarizer', 'pockelsCell', 'eom', 'custom'" },
                    position: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                        },
                        required: ['x', 'y'],
                    },
                    data: {
                        type: Type.OBJECT,
                        properties: {
                           label: { type: Type.STRING },
                           angle: { type: Type.NUMBER, description: "Rotation angle in radians for gates like 'rz'." },
                           handles: {
                                type: Type.ARRAY,
                                description: "Special handles for multi-qubit gates like CNOT or Toffoli for correct visual connection.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING, description: "'source' or 'target'" },
                                        position: { type: Type.STRING, description: "e.g., 'top', 'bottom', 'left', 'right'" },
                                        id: { type: Type.STRING, description: "A unique ID for the handle, e.g., 'ctl_in'" }
                                    },
                                    required: ['type', 'position', 'id']
                                }
                           },
                           photonType: { type: Type.STRING, description: "'single' or 'entangled_pair' for source nodes." },
                           wavelength: { type: Type.NUMBER, description: "Wavelength in nm for source nodes." },
                           purity: { type: Type.NUMBER, description: "Purity from 0 to 1 for source nodes." },
                           basisEncoding: { type: Type.STRING, description: "How qubits are encoded: 'polarization' or 'phase'." },
                           // Advanced Source Parameters
                           photonStatistics: { type: Type.STRING, description: "Photon statistics: 'poisson', 'sub_poisson', or 'heralded'." },
                           indistinguishability: { type: Type.NUMBER, description: "Indistinguishability from 0 to 1 for source nodes." },
                           spectralPurity: { type: Type.NUMBER, description: "Spectral purity from 0 to 1 for source nodes." },
                           repetitionRate: { type: Type.NUMBER, description: "Repetition rate in MHz for source nodes." },

                           efficiency: { type: Type.NUMBER, description: "Efficiency from 0 to 1 for detector nodes." },
                           darkCounts: { type: Type.NUMBER, description: "Dark counts in Hz for detector nodes." },
                           detectorType: { type: Type.STRING, description: "'polarization' or 'phase_interferometer'." },
                           interferometerArmLengthDifference: { type: Type.NUMBER, description: "Arm length difference in mm for phase interferometers." },
                           // Advanced Detector Noise
                           deadTime: { type: Type.NUMBER, description: "Dead time in ns for detector nodes." },
                           afterpulsingProbability: { type: Type.NUMBER, description: "Afterpulsing probability from 0 to 1 for detector nodes." },
                           crosstalkProbability: { type: Type.NUMBER, description: "Crosstalk probability from 0 to 1 for detector nodes." },
                           
                           gateFidelity: { type: Type.NUMBER, description: "Fidelity from 0 to 1 for gate nodes." },
                           gateTime: { type: Type.NUMBER, description: "Gate time in ns for gate nodes." },
                           phaseShift: { type: Type.NUMBER, description: "Phase shift in radians for phase modulators or Rz gates." },
                           polarizationRotatorAngle: { type: Type.NUMBER, description: "Rotation angle in radians for polarization rotators." },
                           initialState: { type: Type.NUMBER, description: "Initial state 0 or 1 for qubit nodes." },
                           t1: { type: Type.NUMBER, description: "T1 time in microseconds for qubit/endNode/repeater memory." },
                           t2: { type: Type.NUMBER, description: "T2 time in microseconds for qubit/endNode/repeater memory." },
                           // Advanced Qubit/Memory Noise
                           amplitudeDampingRate: { type: Type.NUMBER, description: "Amplitude damping rate from 0 to 1 for qubit/memory nodes." },
                           phaseDampingRate: { type: Type.NUMBER, description: "Phase damping rate from 0 to 1 for qubit/memory nodes." },
                           // Advanced Repeater Memory Parameters
                           storageTime: { type: Type.NUMBER, description: "Storage time in microseconds for repeater memories." },
                           storageEfficiency: { type: Type.NUMBER, description: "Storage and retrieval efficiency from 0 to 1 for repeater memories." },
                           memoryNoiseType: { type: Type.STRING, description: "Memory noise type: 'coherent_dephasing' or 'incoherent_depolarizing'." },

                           attackStrategy: { type: Type.STRING, description: "'intercept_resend' for eavesdropper nodes." },
                           basisChoiceBias: { type: Type.NUMBER, description: "Bias from 0 to 1 for eavesdropper's basis choice." },
                           role: { type: Type.STRING, description: "'sender', 'receiver', or 'generic' for endNode nodes." },
                           swapFidelity: { type: Type.NUMBER, description: "Swap fidelity from 0 to 1 for repeater nodes." },
                           memoryT1: { type: Type.NUMBER, description: "Memory T1 time in ms for repeater nodes." },
                           memoryT2: { type: Type.NUMBER, description: "Memory T2 time in ms for repeater nodes." },

                           // Waveplate parameters
                           retardance: { type: Type.NUMBER, description: "Retardance in radians or fractions of lambda (e.g., 0.5 for half-wave plate)." },
                           fastAxisAngle: { type: Type.NUMBER, description: "Fast axis angle in degrees for waveplates." },
                           // Polarizer parameters
                           extinctionRatio: { type: Type.NUMBER, description: "Extinction ratio (e.g., 1000:1) for polarizers." },
                           transmissionAxisAngle: { type: Type.NUMBER, description: "Transmission axis angle in degrees for polarizers." },
                           // Pockels Cell parameters
                           voltage: { type: Type.NUMBER, description: "Applied voltage for Pockels cells." },
                           halfWaveVoltage: { type: Type.NUMBER, description: "Half-wave voltage for Pockels cells." },
                           // EOM parameters
                           modulationIndex: { type: Type.NUMBER, description: "Modulation index for EOMs." },
                           modulationFrequency: { type: Type.NUMBER, description: "Modulation frequency in Hz for EOMs." },
                           // Custom component parameters
                           numQubits: { type: Type.NUMBER, description: "Number of qubits the custom gate acts on." },
                           customGateMatrix: { type: Type.STRING, description: "JSON string representing a 2D array of complex numbers for a custom quantum gate's unitary matrix (e.g., '[[[1,0],[0,0]],[[0,0],[1,0]]]')." },
                           customNoiseModel: { type: Type.STRING, description: "Text description of a custom noise model applied to this component." },
                           customDescription: { type: Type.STRING, description: "A user-provided description for the custom component." },
                        },
                        required: ['label'],
                    }
                },
                required: ['id', 'type', 'position', 'data'],
            }
        },
        edges: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    sourceHandle: { type: Type.STRING },
                    targetHandle: { type: Type.STRING },
                    animated: { type: Type.BOOLEAN },
                    data: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "'quantum' or 'classical'." },
                            length: { type: Type.NUMBER, description: "Length in km." },
                            attenuation: { type: Type.NUMBER, description: "Attenuation in dB/km." },
                            noiseType: { type: Type.STRING, description: "'depolarizing' or 'dephasing'." },
                            noiseProbability: { type: Type.NUMBER, description: "Noise probability from 0 to 1." },
                            dispersion: { type: Type.NUMBER, description: "Group velocity dispersion in ps/(nm·km)." },
                            polarizationDependentLoss: { type: Type.NUMBER, description: "Polarization dependent loss in dB." },
                            temperature: { type: Type.NUMBER, description: "Temperature in Kelvin." },
                            // Advanced Channel Noise
                            thermalNoiseSpectralDensity: { type: Type.NUMBER, description: "Thermal noise spectral density (e.g., W/Hz) for quantum channels." },
                            channelDepolarizingRate: { type: Type.NUMBER, description: "Depolarizing rate from 0 to 1 per km for quantum channels." },
                            channelDephasingRate: { type: Type.NUMBER, description: "Dephasing rate from 0 to 1 per km for quantum channels." },
                            // Advanced Channel Types for realism
                            channelType: { type: Type.STRING, description: "Type of channel: 'fiber' or 'free_space'. Default is 'fiber'." },
                            atmosphericTurbulence: { type: Type.STRING, description: "Severity of atmospheric turbulence for 'free_space' channels: 'weak', 'moderate', or 'strong'." },
                            fadingSeverity: { type: Type.STRING, description: "Severity of fading for 'free_space' channels: 'none', 'low', 'medium', or 'high'." },
                            // New: Classical Channel Parameters
                            classicalBandwidth: { type: Type.NUMBER, description: "Bandwidth in Mbps for classical channels." },
                            classicalLatency: { type: Type.NUMBER, description: "Latency in milliseconds for classical channels." },
                            classicalErrorRate: { type: Type.NUMBER, description: "Error rate from 0 to 1 for classical channels." },
                        },
                        required: ['type'],
                    }
                },
                required: ['id', 'source', 'target', 'data'],
            }
        }
    },
    required: ['nodes', 'edges'],
};


export const generateCircuitFromPrompt = async (prompt: string, forCode: boolean = false) => {
  let fullPrompt: string;
  const availableNodeTypes = `'endNode', 'repeater', 'eavesdropper', 'qubit', 'hadamard', 'cnot', 'measure', 'phase', 'rz', 'x', 'toffoli', 'phaseModulator', 'beamSplitter', 'polarizationRotator', 'interferometer', 'source', 'detector', 'waveplate', 'polarizer', 'pockelsCell', 'eom', 'custom'`;

  if (forCode) {
      fullPrompt = `You are an expert quantum circuit visualizer. Parse the provided Qiskit or OpenQASM code and convert it into a JSON object representing a visual circuit diagram. The JSON must conform to the provided schema.
      - Position the nodes to create a clear, horizontally-laid-out circuit diagram. Start 'qubit' nodes at x=50, and increment x for subsequent gates. Maintain separate y positions for each qubit line.
      - Assign unique string IDs to all nodes and edges.
      - Create one 'qubit' node for each qubit declared or used.
      - For each gate operation in the code, create a corresponding node ('hadamard', 'cnot', 'x', 'rz', 'toffoli', etc.).
      - For an 'rz' gate, parse its rotation angle and store it in radians in the 'data.angle' property.
      - For CNOT and Toffoli gates, you MUST include the special 'handles' array in their 'data' property as defined in the schema to ensure correct visual rendering of multiple inputs/outputs.
      - Create edges to connect the nodes in the correct sequence, representing the flow on each qubit's wire.
      - Ensure the 'source', 'target', 'sourceHandle', and 'targetHandle' properties of edges are correctly set to link the nodes.

      User's code:
      \`\`\`
      ${prompt}
      \`\`\`

      If the user asks for a circuit that utilizes advanced photonic components like 'waveplate', 'polarizer', 'pockelsCell', or 'eom', include those nodes and their corresponding parameters as defined in the schema, using realistic default values (e.g., waveplate retardance=PI/2, fastAxisAngle=0; polarizer extinctionRatio=1000, transmissionAxisAngle=0; PockelsCell voltage=0, halfWaveVoltage=100; EOM modulationIndex=0.5, modulationFrequency=1e9).
      If the user specifies a custom gate or operation, create a 'custom' node and populate 'numQubits', 'customGateMatrix' (a JSON string of its unitary matrix, e.g., '[[[1,0],[0,0]],[[0,0],[1,0]]]'), 'customNoiseModel', and 'customDescription'. The default numQubits should be 1.
      `;
  } else {
      fullPrompt = `You are an expert in quantum networking. Based on the user's request, generate a quantum network diagram. Represent the network as a JSON object that conforms to the provided schema. The user wants: '${prompt}'. 
      Available node types are: ${availableNodeTypes}.
      - 'endNode' represents a user station like Alice or Bob.
      - 'repeater' represents a quantum repeater for long-distance communication.
      - 'eavesdropper' represents an entity like Eve attempting to intercept communication.
      - 'phaseModulator', 'beamSplitter', 'polarizationRotator', 'interferometer' are for more detailed optical setups.
      - 'waveplate', 'polarizer', 'pockelsCell', 'eom' are for advanced photonic control.
      - 'custom' is for a user-defined quantum gate or operation. If you use it, include 'numQubits', 'customGateMatrix' (a JSON string of its unitary matrix, e.g., '[[[1,0],[0,0]],[[0,0],[1,0]]]'), 'customNoiseModel', and 'customDescription'. The default numQubits should be 1.
      - 'x' is the Pauli-X (or NOT) gate. It flips a qubit's state.
      - 'toffoli' is the CCNOT gate. It's a 3-qubit gate.
      - 'rz' is a rotation gate around the Z-axis. If you use it, you can specify a rotation 'angle' in radians in its data property. For example, to create a T gate, use an 'rz' gate with angle: ${Math.PI / 4}.
      - When creating edges, especially for quantum channels, include realistic 'length', 'attenuation', 'dispersion', 'polarizationDependentLoss', and 'temperature' in the 'data' property. Default values for these parameters should be reasonable (e.g., length=10km, attenuation=0.2dB/km, dispersion=0.1ps/(nm·km), PDL=0.05dB, temperature=295K).
      - ALSO, include advanced noise parameters for quantum channels like 'thermalNoiseSpectralDensity' (e.g., 1e-18 W/Hz), 'channelDepolarizingRate' (e.g., 0.0001 per km), and 'channelDephasingRate' (e.g., 0.0001 per km).
      - If the user explicitly asks for a **free-space quantum link**, set 'data.channelType' to 'free_space' on the edge, and include 'atmosphericTurbulence' ('weak', 'moderate', 'strong') and 'fadingSeverity' ('none', 'low', 'medium', 'high') in the edge's data. Otherwise, default 'channelType' to 'fiber'.
      - If the user explicitly asks for a **classical link**, set 'data.type' to 'classical' on the edge, and include 'classicalBandwidth' (e.g., 100 Mbps), 'classicalLatency' (e.g., 5 ms), and 'classicalErrorRate' (e.g., 0.001) in the edge's data. Otherwise, default 'type' to 'quantum'.
      - If the user explicitly mentions "polarization" or "phase" encoding, set 'basisEncoding' on relevant source/endNode components. Use 'detectorType' and 'interferometerArmLengthDifference' for phase-based detectors.
      - For 'Qubit', 'EndNode', 'Repeater' (memory) nodes, include 't1', 't2' and advanced noise parameters 'amplitudeDampingRate' (e.g., 0.001) and 'phaseDampingRate' (e.g., 0.001).
      - For 'Repeater' nodes, also include 'swapFidelity', 'memoryT1', 'memoryT2', 'storageTime' (e.g., 100 microseconds), 'storageEfficiency' (e.g., 0.99), and 'memoryNoiseType' (e.g., 'coherent_dephasing').
      - For 'Source' nodes, include 'photonType', 'wavelength', 'purity', and also advanced parameters 'photonStatistics' (e.g., 'poisson'), 'indistinguishability' (e.g., 0.99), 'spectralPurity' (e.g., 0.99), and 'repetitionRate' (e.g., 100 MHz).
      - For 'Detector' nodes, include 'efficiency', 'darkCounts' and advanced noise parameters 'deadTime' (e.g., 100 ns), 'afterpulsingProbability' (e.g., 0.005), and 'crosstalkProbability' (e.g., 0.01).
      - For 'Waveplate', 'Polarizer', 'PockelsCell', 'EOM' components, set their specific parameters (e.g., 'retardance'=0.5*PI, 'fastAxisAngle'=0; 'extinctionRatio'=1000, 'transmissionAxisAngle'=0; 'voltage'=0, 'halfWaveVoltage'=100; 'modulationIndex'=0.5, 'modulationFrequency'=1e9) and ensure 'gateFidelity' is present.
      Provide positions for the nodes that make the diagram clear and readable on a 2D canvas, laid out horizontally. Ensure all node and edge IDs are unique strings.`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: circuitSchema,
      },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating circuit from Gemini:", error);
    throw new Error("Failed to generate circuit. The model might have returned an invalid format.");
  }
};

export const generateCodeFromCircuit = async (circuitJson: string, language: 'qiskit' | 'openqasm') => {
    const prompt = `You are an expert Qiskit programmer. Convert the following JSON representation of a quantum circuit into ${language} code.
The JSON describes nodes (qubits, gates) and edges (connections).
- 'nodes' contains a list of components. 'edges' define the connections between them.
- Find all 'qubit' type nodes to determine the number of qubits required.
- The circuit flows from left to right, generally following the x-position of the nodes.
- Apply gates like 'hadamard', 'x', 'cnot' to the corresponding qubits. Edges show the data flow.
- For a 'cnot' node, an incoming edge with 'targetHandle: "ctl_in"' comes from the control qubit. An incoming edge with 'targetHandle: "tgt_in"' comes from the target qubit.
- For an 'rz' gate, use the 'angle' from the node's 'data' property.
- For a 'toffoli' (CCNOT) gate, identify the two control qubits and one target qubit from the incoming edges and their handles ('ctl1_in', 'ctl2_in', 'tgt_in').
- For Qiskit, create a QuantumCircuit and append the operations. Add measurements at the end for all qubits that terminate in a 'measure' node.
- For OpenQASM 2.0, declare the qreg and creg, apply the gates, and add measurements.
- Your response MUST be only the code, with no explanations, backticks, or markdown formatting.

Circuit JSON:
${circuitJson}

If the circuit includes components like 'waveplate', 'polarizer', 'pockelsCell', or 'eom', describe their classical control or equivalent quantum operations in Qiskit if possible, or add comments indicating their function if direct Qiskit gates are not available. Pay attention to their specific parameters like 'retardance', 'fastAxisAngle', 'extinctionRatio', 'transmissionAxisAngle', 'voltage', 'halfWaveVoltage', 'modulationIndex', 'modulationFrequency' and 'gateFidelity'.
If the circuit includes a 'custom' node, represent it as a custom unitary gate (using the 'customGateMatrix' if provided) in Qiskit, acting on 'numQubits'. Add comments about its 'customNoiseModel' and 'customDescription', 'gateFidelity', and 'gateTime'.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating code from Gemini:", error);
        throw new Error("Failed to generate code from circuit.");
    }
};

export const generateHardwareCodeFromCircuit = async (circuitJson: string, language: 'verilog') => {
    const prompt = `You are an expert in both quantum communication protocols and digital logic design for FPGAs. Your task is to analyze the provided quantum network JSON and, if it represents a QKD protocol like BB84, generate a synthesizable Verilog module to act as a controller for one of the end nodes (e.g., Alice or Bob).

The Verilog module should perform the classical tasks of the BB84 protocol.

**Instructions:**
1.  **Analyze the Circuit:** Determine if the network topology (nodes like 'endNode', 'eavesdropper'; edges representing channels) corresponds to a BB84 QKD setup. If not, return a comment saying the circuit is not a recognized QKD protocol.
2.  **Generate a Verilog Module:** If it is a BB84 setup, create a module named \`bb84_controller\`.
3.  **Module I/O:**
    -   **Inputs:** \`clk\` (50MHz clock), \`reset_n\` (active-low reset), \`start_protocol\` (a pulse to begin a round of N measurements), \`photon_value\` (the 0/1 result from a detector), \`photon_valid\` (indicates a photon was detected and its value is valid), \`other_party_bases\` (input bus for receiving the other party's basis choices during sifting), \`sifting_start\` (pulse to begin the sifting phase).
    -   **Outputs:** \`basis_choice\` (output to control the local measurement/preparation basis, e.g., 0 for Z, 1 for X), \`sifted_key_bit\` (a single bit of the final key), \`sifted_key_valid\` (pulse indicating a new sifted key bit is available on the output), \`local_bases_out\` (bus to send local bases to the other party), \`protocol_busy\`.
4.  **Internal Logic:**
    -   **State Machine:** Implement a simple state machine with states like \`IDLE\`, \`GENERATE_BASES\`, \`AWAIT_SIFTING\`, \`SIFTING\`, \`OUTPUT_KEY\`.
    -   **Basis Generation:** Use a Linear Feedback Shift Register (LFSR) as a pseudo-random number generator to choose the measurement/preparation basis. This is a common and efficient technique in FPGAs. Store the choices in a register array or small memory.
    -   **Sifting Logic:** When \`sifting_start\` is asserted, compare the stored local basis choices with the \`other_party_bases\` input. If they match, store the corresponding measured photon value as part of the sifted key.
    -   **Key Storage:** Store the generated basis choices, measured photon values, and the final sifted key in registers.
5.  **Code Style:**
    -   The code MUST be well-commented to explain what each part does (state machine, LFSR, sifting logic).
    -   Use non-blocking assignments (\`<=\`) for sequential logic inside \`always @(posedge clk)\` blocks.
    -   Your response MUST be only the Verilog code, with no explanations, backticks, or markdown formatting.

Circuit JSON:
${circuitJson}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        // The model might wrap the code in ```verilog ... ```, so let's clean that up.
        let code = response.text.trim();
        if (code.startsWith('```verilog')) {
            code = code.substring(9);
        } else if (code.startsWith('```')) {
            code = code.substring(3);
        }
        if (code.endsWith('```')) {
            code = code.substring(0, code.length - 3);
        }
        return code.trim();
    } catch (error) {
        console.error("Error generating hardware code from Gemini:", error);
        throw new Error("Failed to generate hardware code from circuit.");
    }
};


const protocolAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        protocolName: { type: Type.STRING, description: "The name of the detected protocol, e.g., 'BB84'." },
        qber: { type: Type.NUMBER, description: "The calculated Quantum Bit Error Rate as a value between 0.0 and 1.0." },
        securityAssessment: { type: Type.STRING, description: "A detailed but clear assessment in Persian of the protocol's security in this specific simulation. Explain if the eavesdropper was detected and why, based on the QBER and network conditions." },
        keys: {
            type: Type.OBJECT,
            properties: {
                aliceSentBasis: { type: Type.STRING, description: "A string of Z and X representing the bases Alice used to encode her bits (e.g., 'ZXXZZXZX...')." },
                bobMeasureBasis: { type: Type.STRING, description: "A string of Z and X representing the bases Bob used to measure." },
                eveEavesdropBasis: { type: Type.STRING, description: "A string of Z and X representing the bases Eve used. Omit if no eavesdropper." },
                aliceSiftedKey: { type: Type.STRING, description: "Alice's final key after sifting, with non-matching basis bits replaced by '-' (e.g., '0--1-0-1')." },
                bobSiftedKey: { type: Type.STRING, description: "Bob's final key after sifting, with non-matching basis bits replaced by '-' (e.g., '0--1-0-1')." },
                eveSiftedKey: { type: Type.STRING, description: "Eve's sifted key, showing the bits she managed to intercept correctly. Use '-' for non-matching bases (e.g., '--1-0-1-')." },
            },
        },
    },
    required: ['protocolName', 'qber', 'securityAssessment', 'keys']
};


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A clear, descriptive title for the experiment this network performs (e.g., 'Entanglement Distribution over a Noisy Channel')."
        },
        objective: {
            type: Type.STRING,
            description: "A one or two-sentence summary of the experiment's goal in Persian."
        },
        theoreticalBackground: {
            type: Type.STRING,
            description: "A concise but insightful explanation in Persian of the key quantum principles at play (e.g., entanglement, decoherence, quantum repeaters)."
        },
        experimentalSetupAnalogy: {
            type: Type.STRING,
            description: "In Persian, describe a possible real-world laboratory setup to perform this experiment. For networks, mention technologies like fiber optic channels, quantum dots for memories, and SPDC sources."
        },
        protocolTrace: {
            type: Type.ARRAY,
            description: "An array of events explaining the protocol execution step-by-step across the network. This is the primary log of the simulation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nodeId: { type: Type.STRING, description: "The ID of the node where the event occurred." },
                    nodeLabel: { type: Type.STRING, description: "The label of the node." },
                    event: { type: Type.STRING, description: "A short name for the event (e.g., 'Generate Entangled Pair', 'Photon Transmission', 'Entanglement Swap Attempt')." },
                    description: { type: Type.STRING, description: "A plain-language Persian explanation of this event and its outcome." },
                    time: { type: Type.NUMBER, description: "Simulated time of the event in milliseconds (ms)." },
                    state: { type: Type.STRING, description: "Optional: A representation of the relevant quantum state at this point (e.g., Fidelity, state vector or Bloch sphere coordinates if single qubit)." }
                },
                required: ['nodeId', 'nodeLabel', 'event', 'description']
            }
        },
        resultsAnalysis: {
            type: Type.STRING,
            description: "A detailed interpretation in Persian of the final results. Explain what the network performance metrics *mean* in the context of the experiment's objective. Compare the ideal vs noisy results."
        },
        errorSourceAnalysis: { // Structured output for error budget analysis
            type: Type.ARRAY,
            description: "A detailed analysis in Persian of the primary sources of error, structured as an array of objects. Each object should include the error source, its approximate percentage contribution to overall performance degradation (e.g., QBER or fidelity loss), and a brief Persian description of the mechanism. The sum of contributions should ideally be 100%.",
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING, description: "The specific error source (e.g., 'Channel 1 Attenuation', 'Repeater 1 Memory T1', 'Detector 2 Crosstalk', 'Waveplate 1 Retardance Error')." },
                    contribution: { type: Type.NUMBER, description: "Approximate percentage contribution to total error/degradation (e.g., 25 for 25%)." },
                    description: { type: Type.STRING, description: "A brief Persian explanation of this error source." },
                },
                required: ['source', 'contribution', 'description']
            }
        },
        optimizationSuggestions: {
            type: Type.STRING,
            description: "Based on the error analysis, provide actionable suggestions in Persian for optimizing the network protocol or hardware parameters to improve performance. Consider suggestions related to dispersion compensation, temperature control, choice of encoding (polarization vs. phase), and mitigation of all identified noise sources (amplitude/phase damping, dead time, afterpulsing, crosstalk, memory noise type), as well as source improvements (photon statistics, indistinguishability, spectral purity, repetition rate), and strategies for free-space links (adaptive optics for turbulence, choice of link for fading). Also suggest improvements for photonic components (e.g., using higher extinction ratio polarizers, precise voltage control for Pockels cells) and classical channel optimization (e.g., increasing bandwidth, reducing latency, using classical error correction codes)."
        },
        potentialApplications: {
            type: Type.STRING,
            description: "In Persian, discuss the practical applications or the role this network protocol plays in the future quantum internet."
        },
        measurementProbabilities: {
            type: Type.ARRAY,
            description: "An array of all possible measurement outcomes and their THEORETICAL probabilities in an ideal, noiseless scenario.",
            items: {
                type: Type.OBJECT,
                properties: {
                    state: { type: Type.STRING, description: "The basis state, e.g., '00'." },
                    probability: { type: Type.NUMBER, description: "The probability of measuring this state, from 0.0 to 1.0." }
                },
                required: ['state', 'probability']
            }
        },
        measurementCounts: {
            type: Type.ARRAY,
            description: "An array of simulated measurement outcomes and their counts based on the specified shots and network noise model.",
            items: {
                type: Type.OBJECT,
                properties: {
                    state: { type: Type.STRING, description: "The basis state, e.g., '00'." },
                    count: { type: Type.INTEGER, description: "The number of times this state was 'measured'." }
                },
                required: ['state', 'count']
            }
        },
        finalStateVector: {
            type: Type.STRING,
            description: "The IDEAL (noiseless) final quantum state vector of the system, in bra-ket notation (e.g., '0.707|00⟩ + 0.707|11⟩')."
        },
        densityMatrix: {
            type: Type.STRING,
            description: "The final density matrix of the system as a JSON string representing a 2D array of complex numbers (e.g., '[[[1,0], [0,0]], [[0,0], [0,0]]]'). Each complex number [real, imag]. This is mandatory if noise is simulated."
        },
        qubitStates: {
            type: Type.ARRAY,
            description: "State descriptions for individual qubits for Bloch sphere visualization. This might be less relevant for network-end-points.",
            items: {
                type: Type.OBJECT,
                properties: {
                    qubit: { type: Type.STRING, description: "The ID or label of the qubit/node." },
                    state: { type: Type.STRING, description: "A simplified description of the qubit's state." },
                    blochSphere: {
                        type: Type.OBJECT,
                        properties: {
                            theta: { type: Type.NUMBER, description: "Polar angle in radians (0 to PI)." },
                            phi: { type: Type.NUMBER, description: "Azimuthal angle in radians (0 to 2*PI)." },
                            purity: { type: Type.NUMBER, description: "Purity/length of Bloch vector (0.0 to 1.0)." }
                        },
                    }
                },
                required: ['qubit', 'state']
            }
        },
        protocolAnalysis: {
            ...protocolAnalysisSchema,
            description: "An analysis of the quantum communication protocol, if one is detected. Omit this field if the circuit is not a communication protocol.",
        },
        networkPerformance: {
            type: Type.OBJECT,
            description: "Key performance indicators for the simulated quantum network.",
            properties: {
                endToEndFidelity: { type: Type.NUMBER, description: "The fidelity of the final quantum state distributed between the end nodes, from 0.0 to 1.0." },
                keyRate: { type: Type.NUMBER, description: "For QKD protocols, the final secure key rate in bits per second (bps)." },
                latency: { type: Type.NUMBER, description: "The end-to-end time for one successful round of the protocol in milliseconds (ms)." },
                successProbability: { type: Type.NUMBER, description: "The overall probability of the protocol succeeding in one attempt." }
            }
        },
        wignerQFunctionDescription: {
            type: Type.STRING,
            description: "A textual description in Persian of the Wigner or Q-function of the final quantum state, especially if it's a mixed state or involves continuous variables. Describe its key features, negativity (if Wigner), and what it implies about the state's quantumness."
        },
        sweepResults: {
            type: Type.ARRAY,
            description: "Results from a parameter sweep, if one was performed. Contains results for multiple runs with varying parameter values.",
            items: {
                type: Type.OBJECT,
                properties: {
                    parameter: { type: Type.STRING, description: "The name of the parameter that was swept (e.g., 'length', 'attenuation')." },
                    unit: { type: Type.STRING, description: "The unit of the parameter (e.g., 'km', 'dB', '%')." },
                    results: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                value: { type: Type.NUMBER, description: "The specific value of the swept parameter for this run." },
                                qber: { type: Type.NUMBER, description: "The Quantum Bit Error Rate for this run." },
                                fidelity: { type: Type.NUMBER, description: "The end-to-end fidelity for this run." },
                                keyRate: { type: Type.NUMBER, description: "The key rate for this run." },
                                latency: { type: Type.NUMBER, description: "The latency for this run." },
                            },
                            required: ['value']
                        }
                    }
                },
                required: ['parameter', 'results']
            }
        }
    },
    required: ['title', 'objective', 'theoreticalBackground', 'experimentalSetupAnalogy', 'resultsAnalysis', 'measurementProbabilities', 'finalStateVector', 'qubitStates', 'potentialApplications']
};

const getModeSpecificInstructions = (mode: AnalysisMode): string => {
  switch (mode) {
    case 'security':
      return `
      *** Analysis Focus: SECURITY ***
      - Your primary objective is to perform a security analysis, assuming the network might be a Quantum Key Distribution (QKD) protocol.
      - You MUST prioritize filling out the 'protocolAnalysis' section of the JSON output.
      - The calculation of the Quantum Bit Error Rate (QBER) is critical. It must be based on a comparison between the sender's (Alice) and receiver's (Bob) sifted keys, factoring in channel noise (including thermal noise, depolarizing/dephasing rates, free-space turbulence, fading severity), detector characteristics (including dead time, afterpulsing, crosstalk), photonic component imperfections (e.g., waveplate retardance/angle errors, polarizer extinction ratio), and any eavesdropper (Eve) activity.
      - The 'securityAssessment' must be detailed, explaining whether Eve's presence was detectable from the QBER and why, also considering different encoding schemes (polarization vs. phase) and classical channel limitations (latency, bandwidth, error rate impacting sifting/reconciliation).
      - The 'keys' object must be populated with sample bit and basis strings for Alice, Bob, and Eve (if present) to illustrate the protocol's stages.
      - Other sections like detailed state vectors are secondary. Focus on the results relevant to security.`;
    case 'performance':
      return `
      *** Analysis Focus: NETWORK PERFORMANCE ***
      - Your primary objective is to evaluate the performance of this quantum network.
      - You MUST prioritize filling out the 'networkPerformance' and 'protocolTrace' sections of the JSON output. The protocol trace is mandatory.
      - Key metrics to calculate are: 'endToEndFidelity' of the shared quantum state, 'successProbability' of the entire protocol, 'keyRate' (if applicable), and 'latency'.
      - The 'protocolTrace' should log key events, especially probabilistic ones like photon loss in channels (considering all noise and free-space effects, as well as classical channel latency and bandwidth constraints, classical error rates), entanglement swap failures/successes at repeaters (considering swap fidelity, memory decoherence including T1/T2, amplitude/phase damping, storage time, storage efficiency, memory noise type), and state degradation due to various noise sources (including photonic components).
      - The 'resultsAnalysis' and 'errorSourceAnalysis' must focus on how physical parameters (channel length, attenuation, dispersion, PDL, thermal noise, depolarizing/dephasing rates, free-space turbulence, fading severity, repeater fidelity, memory decoherence, storage time, storage efficiency, memory noise type, detector efficiency, dark counts, dead time, afterpulsing, crosstalk, source photon statistics, indistinguishability, spectral purity, repetition rate, photonic component parameters, custom component operations/noise, AND classical channel bandwidth/latency/error rate) directly impact the performance metrics. Provide a bottleneck analysis.`;
    case 'state':
      return `
      *** Analysis Focus: QUANTUM STATE ***
      - Your primary objective is a deep analysis of the quantum state of the system.
      - You MUST prioritize providing the most accurate and detailed 'finalStateVector' (ideal case) and 'densityMatrix' (noisy case).
      - The 'qubitStates' section must be filled for relevant qubits to enable Bloch sphere visualizations.
      - A detailed 'stepByStepExplanation' showing the evolution of the state vector after each major operation is highly preferred over a network-level 'protocolTrace'. If the network is complex, you may use 'protocolTrace' but include state information in its events.
      - The 'measurementProbabilities' (ideal) and 'measurementCounts' (noisy) are critical outputs.
      - Analysis should focus on the quantum mechanical properties of the final state (e.g., degree of entanglement, purity, and how amplitude/phase damping, memory noise, various channel/component imperfections including photonic components, and custom gate operations/noise affect them).
      - If the final state is a mixed state or if continuous variable components are present, you MUST provide a detailed 'wignerQFunctionDescription' in Persian. Describe its key features, such as negativity (if Wigner), and what it implies about the state's quantumness.`;
    case 'errorBudget':
      return `
      *** Analysis Focus: ERROR BUDGET & OPTIMIZATION ***
      - Your primary objective is to identify and quantify all significant sources of error in the network.
      - You MUST prioritize filling out the 'errorSourceAnalysis' and 'optimizationSuggestions' sections of the JSON output. These must be extremely detailed.
      - In 'errorSourceAnalysis', provide a structured array of ErrorContribution objects. Each object MUST include 'source', 'contribution' (as a percentage, e.g., 25 for 25%), and a 'description'. The sum of 'contribution' should ideally be 100%. The analysis MUST focus on: channel loss (attenuation, dispersion, PDL, thermal noise, depolarizing/dephasing rates, free-space turbulence, fading severity, channel type, AND classical channel bandwidth/latency/error rate), repeater imperfections (swap fidelity, memory decoherence including T1/T2, amplitude/phase damping, storage time, storage efficiency, memory noise type), source/detector inefficiencies (efficiency, dark counts, dead time, afterpulsing, crosstalk, photon statistics, indistinguishability, spectral purity, repetition rate), as well as gate errors (gate fidelity, gate time), photonic component imperfections (waveplate retardance/angle, polarizer extinction ratio/angle, Pockels cell/EOM voltage/modulation parameters), and custom gate operations/noise.
      - In 'optimizationSuggestions', provide concrete, actionable advice. For instance, "Reducing the attenuation on the 50km fiber channel from 0.2 dB/km to 0.18 dB/km would yield the largest performance gain, improving end-to-end fidelity by an estimated 5%. Consider using adaptive optics for free-space links to mitigate turbulence." Also consider suggestions related to dispersion compensation, temperature control, choice of encoding (polarization vs. phase), and mitigation strategies for amplitude/phase damping, dead time, afterpulsing, crosstalk, memory noise type, and source photon quality. For classical channels, suggest improvements in bandwidth, latency, or error correction. For photonic components, suggest improvements like higher extinction ratio polarizers, more precise voltage control for Pockels cells, or optimized EOM modulation.
      - The 'resultsAnalysis' should also be framed from the perspective of how errors impacted the outcome.
      - Other sections like detailed theoretical background are less important.`;
    case 'educational':
      return `
      *** Analysis Focus: EDUCATIONAL EXPLANATION (FOR BEGINNERS) ***
      - Your primary objective is to explain the quantum network and its results in a simple, clear, and pedagogical manner, suitable for an absolute beginner or university undergraduate.
      - You MUST prioritize simple language. Use analogies to explain complex concepts. For example, 'superposition is like a spinning coin, it's both heads and tails at once until it lands'. 'Entanglement is like a pair of "magic" coins; if one lands heads, the other instantly becomes tails, no matter how far apart they are.'
      - **Define all key terms**: Explicitly define 'qubit', 'superposition', 'entanglement', 'measurement', 'polarization', 'phase', 'dispersion', 'amplitude damping', 'phase damping', 'dead time', 'crosstalk', 'photon statistics', 'indistinguishability', 'spectral purity', 'repetition rate', 'storage time', 'storage efficiency', 'memory noise type', 'channel type', 'atmospheric turbulence', 'fading severity', 'waveplate', 'polarizer', 'pockels cell', 'eom', 'classical bandwidth', 'classical latency', 'classical error rate', 'custom gate' etc., in the 'theoreticalBackground'.
      - **Explain the 'Why'**: In the 'protocolTrace' or 'stepByStepExplanation', don't just state what happens. Explain the *purpose* of each component and its parameters. For example: "The Hadamard gate is applied here to put the qubit into superposition, which is the crucial first step for creating entanglement." "A long fiber optic cable with high attenuation will lose many photons, reducing the chance of successful communication. Free-space channels, while not needing fiber, are affected by the atmosphere, causing turbulence and fading. Classical channels are used to send normal data, like confirming a photon arrived, but if their latency is too high, the quantum protocol will slow down."
      - The 'resultsAnalysis' must be simplified. Avoid jargon. Focus on the high-level meaning. For example, instead of a deep dive into the density matrix, explain *why* the final state is mixed (e.g., "Because some photons were lost in the fiber optic cable or due to atmospheric turbulence in a free-space link, our final entangled state isn't perfect. This imperfection, which we call a 'mixed' state, reduces the quality of our quantum connection.").
      - Omit highly technical data like the full 'densityMatrix' string unless it's essential to illustrate a key point, and if you do, explain what it represents. The ideal 'finalStateVector' is sufficient for most educational purposes. Compare and contrast polarization-based and phase-based encoding in BB84 if both types of components are present, explaining their basic principles. Also, explain the trade-offs between fiber and free-space channels. For custom gates, explain their intended operation and how they affect the circuit. Explain how photonic components like waveplates and polarizers manipulate light and their importance.`;
    case 'comprehensive':
    default:
      return `
      *** Analysis Focus: COMPREHENSIVE ***
      - Your objective is to provide a complete and balanced report covering all aspects: network performance, security (if applicable), and detailed quantum state analysis.
      - Ensure all sections of the JSON schema are populated with high-quality, detailed information as appropriate for the given network. The 'protocolTrace' is mandatory for network simulations.
      - The 'errorSourceAnalysis' should be a structured array of ErrorContribution objects, similar to the 'errorBudget' mode.
      - If the final state is a mixed state or if continuous variable components are present, you MUST provide a detailed 'wignerQFunctionDescription' in Persian. Describe its key features, such as negativity (if Wigner), and what it implies about the state's quantumness.`;
  }
}

export const analyzeCircuitWithGemini = async (circuitJson: string, settings: SimulationSettings, mode: AnalysisMode) => {
    
    const modeInstructions = getModeSpecificInstructions(mode);

    const prompt = `You are a world-class quantum network physicist and a university-level educator. Your task is to perform an in-depth simulation and analysis of the provided quantum NETWORK topology and generate a sophisticated, comprehensive, and pedagogical report in Persian. This is NOT a simple circuit; it's a network of nodes connected by physical channels.

    ${modeInstructions}

    Network Topology and Component Parameters:
    ${circuitJson}
    
    *** Core Simulation Instructions ***
    You MUST model the physical properties of the network realistically.
    1.  **Quantum Channels (Edges with type 'quantum'):** Each edge has 'length' (km), 'attenuation' (dB/km), 'dispersion' (ps/(nm·km)), 'polarizationDependentLoss' (dB), 'temperature' (K), and now also 'thermalNoiseSpectralDensity' (W/Hz), 'channelDepolarizingRate', 'channelDephasingRate'.
        -   Crucially, now edges can also have 'channelType' ('fiber' or 'free_space'), and for 'free_space' channels, 'atmosphericTurbulence' ('weak', 'moderate', 'strong') and 'fadingSeverity' ('none', 'low', 'medium', 'high').
        -   You MUST calculate the photon survival probability for each channel using the formula: P_survival = 10^(-(attenuation * length) / 10). For 'free_space' channels, this survival probability MUST also be degraded by 'atmosphericTurbulence' (e.g., beam wandering, scintillation) and 'fadingSeverity' (e.g., deep fades).
        -   You MUST consider the effects of 'dispersion' (e.g., pulse broadening, time-of-arrival jitter), 'polarizationDependentLoss' (e.g., degradation of polarization encoding fidelity), 'thermalNoiseSpectralDensity' (adding noise photons/power to the channel), 'channelDepolarizingRate' (randomizing qubit state), and 'channelDephasingRate' (randomizing qubit phase) on the transmitted qubits.
        -   'Temperature' can influence both attenuation and dispersion, model this subtly.
        -   These probabilities and physical effects determine if a qubit is lost, its state is degraded, and contribute to latency (due to required retries).
    2.  **Classical Channels (Edges with type 'classical'):** These channels are crucial for many quantum protocols (e.g., sifting, error reconciliation, privacy amplification). You MUST consider their 'classicalBandwidth' (influences key reconciliation speed and protocol completion time), 'classicalLatency' (adds to overall protocol round trip time), and 'classicalErrorRate' (might necessitate classical error correction or re-transmission, further impacting latency and complexity). Discuss how these classical factors interact with quantum performance.
    3.  **Repeater Nodes:** These nodes perform entanglement swapping. This is a probabilistic operation. You must model its 'swapFidelity', which degrades the quality of the entangled state even on success. Also consider its internal 'memoryT1'/'memoryT2', 'amplitudeDampingRate', and 'phaseDampingRate' for decoherence if a qubit must be stored.
        -   Furthermore, consider the 'storageTime' (how long the qubit is stored before swapping, affecting decoherence), 'storageEfficiency' (loss during storage/retrieval), and 'memoryNoiseType' ('coherent_dephasing' or 'incoherent_depolarizing') for advanced memory modeling.
    4.  **Source Nodes:** These nodes generate photons. Beyond 'photonType', 'wavelength', 'purity', 'basisEncoding', consider 'photonStatistics' (e.g., 'poisson' for single-photon imperfections, 'heralded' for better quality), 'indistinguishability' (0 to 1, crucial for multi-photon interference), 'spectralPurity' (0 to 1, affects interference), and 'repetitionRate' (influences key rate).
    5.  **Detector Nodes:** Beyond 'efficiency', 'darkCounts', 'detectorType', 'interferometerArmLengthDifference', consider 'deadTime', 'afterpulsingProbability', 'crosstalkProbability' and their combined impact on QBER and key rate.
    6.  **Photonic Components ('waveplate', 'polarizer', 'pockelsCell', 'eom'):** These components will modify the quantum state (especially polarization or phase). You MUST accurately model their effect based on their parameters ('retardance', 'fastAxisAngle', 'extinctionRatio', 'transmissionAxisAngle', 'voltage', 'halfWaveVoltage', 'modulationIndex', 'modulationFrequency') and their inherent 'gateFidelity'. Their imperfections contribute to noise and QBER.
    7.  **Custom Components ('custom'):** For 'custom' nodes, you MUST interpret 'customGateMatrix' as a unitary operation acting on 'numQubits' qubits. If 'customNoiseModel' is provided, apply this described noise. The 'customDescription' provides context for the operation. Factor these into the overall simulation, especially how they affect state evolution, entanglement, and QBER.
    8.  **End Nodes & Other Components:** Use the component-specific parameters provided in their 'data' objects (e.g., 'gateFidelity', 'gateTime', 'phaseShift', 'polarizationRotatorAngle'). Also apply 'amplitudeDampingRate' and 'phaseDampingRate' to internal qubits/memories in 'Qubit' and 'EndNode' components. These are high-priority. For any parameter not specified on a component, you may fall back to the global settings if provided.
    9.  **Simulation Goal:** The primary goal is usually to establish a high-fidelity entangled pair between two distant end nodes (e.g., Alice and Bob) or to execute a QKD protocol like BB84. Your entire analysis should revolve around the success and quality of this goal.
    10. **Noise Model:** The simulation MUST be noisy, considering all the factors above (quantum channel loss, dispersion, PDL, thermal noise, channel depolarizing/dephasing, free-space turbulence/fading, gate/swap infidelity, decoherence, amplitude/phase damping, repeater memory imperfections, source photon quality, detector inefficiencies, dead time, afterpulsing, crosstalk, photonic component imperfections, custom gate operations/noise, AND classical channel limitations). The global settings ('gateErrorProbability', 't1', 't2', etc.) should be applied as a baseline noise layer on top of the network-specific effects.
    
    *** Output Generation Instructions ***
    Your response MUST be a single JSON object that conforms to the provided schema.
    -   **protocolTrace / stepByStepExplanation:** Depending on the analysis mode, one of these is critical. For network-level analysis (performance, security, comprehensive), provide a detailed, chronological 'protocolTrace'. For 'state' analysis, a 'stepByStepExplanation' is preferred. The trace should log events like: "Alice's EndNode generates a pair (considering source purity, indistinguishability, repetition rate)," "Photon transmitted through Channel 1 (fiber/free-space, considering length, attenuation, dispersion, PDL, turbulence, fading)," "Photon is LOST in Channel 1 (Probabilistic event)," "Classical message sent via Channel 2 (considering classicalLatency, classicalBandwidth, classicalErrorRate, which might cause retransmission)," "Protocol restarts," "Repeater 1 attempts entanglement swap (considering swap fidelity, memory storage time, storage efficiency, memory noise type, amplitude damping)," "Swap succeeds but reduces fidelity to 0.92, also affected by memory amplitude damping and phase damping."
    -   **networkPerformance:** For relevant modes, you MUST calculate and provide the key network metrics. The 'endToEndFidelity' of the final distributed state is the most important output. For QKD, 'keyRate' is also essential.
    -   **resultsAnalysis & errorSourceAnalysis:** Your analysis must be from a NETWORK perspective. Explain HOW channel length, attenuation, dispersion, PDL, thermal noise, channel depolarizing/dephasing, free-space turbulence/fading, repeater fidelity, memory decoherence (T1/T2, amplitude/phase damping, storage time, storage efficiency, memory noise type), source parameters (photon statistics, indistinguishability, spectral purity, repetition rate), detector efficiency, dark counts, dead time, afterpulsing, crosstalk, photonic component imperfections, custom gate operations/noise, AND classical channel bandwidth/latency/error rate contributed to the final performance metrics. For example: "The 100km total distance in a 'free_space' channel with 'moderate' atmospheric turbulence resulted in a low P_survival of 0.005, which was the main bottleneck for the key rate due to beam wander and high path loss. The repeater's swap fidelity of 0.95 combined with memory amplitude damping of 0.001 per ms and a 'coherent_dephasing' memory noise type was the second-largest contributor to the final end-to-end fidelity drop, especially with long 'storageTime'. The low 'indistinguishability' of the source also slightly degraded the initial entanglement quality. The high 'classicalLatency' of 50ms on the classical control channel added significant overhead to the overall protocol latency, requiring optimization of classical signaling. Errors in 'Waveplate 1' due to low gateFidelity also slightly degraded polarization purity."
    -   **measurementCounts:** Based on the noisy simulation, generate 'measurementCounts' for ${settings.shots} total shots. The distribution should reflect the final, imperfect state.
    -   **densityMatrix:** Provide the final density matrix for the end-to-end state (e.g., the 2-qubit state shared by Alice and Bob).
    -   **wignerQFunctionDescription:** If the final state is a mixed state or involves continuous variables, provide a textual description of its Wigner or Q-function.

    *** QKD Protocol Analysis (if applicable) ***
    If the network implements a protocol like BB84:
    -   Your simulation must explicitly model the transmission, eavesdropping (if Eve is present), and sifting stages.
    -   The **QBER** calculation must be realistic, factoring in quantum channel noise (attenuation, dispersion, PDL, thermal noise, depolarizing/dephasing, free-space turbulence/fading), detector dark counts, dead time, afterpulsing, crosstalk, source imperfections, photonic component imperfections, custom gate operations/noise, AND Eve's disturbance.
    -   In 'securityAssessment', explain how the network's physical properties affect security. A long, lossy 'free_space' channel with high dispersion and significant thermal noise and fading makes it harder to distinguish Eve's influence from natural noise. Discuss the impact of chosen encoding (polarization vs. phase) on security and implementation complexity, also considering how waveplates and polarizers might be used by Alice/Bob or Eve. Explain how limitations of classical channels (latency, bandwidth, error rate) can indirectly affect the security (e.g., by slowing down sifting and giving Eve more time, or if classical errors lead to incorrect basis reconciliation).`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        // Ensure protocolTrace is always present if stepByStepExplanation is not, for consistency
        if (!result.protocolTrace && !result.stepByStepExplanation) {
          result.protocolTrace = [];
        }


        return result;
    } catch(error) {
        console.error("Error analyzing circuit with Gemini:", error);
        throw new Error("Failed to get analysis result from AI.");
    }
}