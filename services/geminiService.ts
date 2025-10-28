import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SimulationSettings, AnalysisMode } from "../types";

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
                    type: { type: Type.STRING, description: "Should be one of: 'qubit', 'hadamard', 'cnot', 'measure', 'phase', 'rz', 'x', 'toffoli', 'eavesdropper', 'endNode', 'repeater'" },
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
                },
                required: ['id', 'source', 'target'],
            }
        }
    },
    required: ['nodes', 'edges'],
};


export const generateCircuitFromPrompt = async (prompt: string, forCode: boolean = false) => {
  let fullPrompt: string;
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
      \`\`\``;
  } else {
      fullPrompt = `You are an expert in quantum networking. Based on the user's request, generate a quantum network diagram. Represent the network as a JSON object that conforms to the provided schema. The user wants: '${prompt}'. 
      Available node types are: 'endNode', 'repeater', 'eavesdropper', 'qubit', 'hadamard', 'cnot', 'measure', 'phase', 'rz', 'x', 'toffoli'.
      - 'endNode' represents a user station like Alice or Bob.
      - 'repeater' represents a quantum repeater for long-distance communication.
      - For simple circuits, use the standard gates. For network protocols, use the network nodes.
      - 'x' is the Pauli-X (or NOT) gate. It flips a qubit's state.
      - 'toffoli' is the CCNOT gate. It's a 3-qubit gate.
      - 'rz' is a rotation gate around the Z-axis. If you use it, you can specify a rotation 'angle' in radians in its data property. For example, to create a T gate, use an 'rz' gate with angle: ${Math.PI / 4}.
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
${circuitJson}`;

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
                    state: { type: Type.STRING, description: "Optional: A representation of the relevant quantum state at this point (e.g., Fidelity, state vector)." }
                },
                required: ['nodeId', 'nodeLabel', 'event', 'description']
            }
        },
        resultsAnalysis: {
            type: Type.STRING,
            description: "A detailed interpretation in Persian of the final results. Explain what the network performance metrics *mean* in the context of the experiment's objective. Compare the ideal vs noisy results."
        },
        errorSourceAnalysis: {
            type: Type.STRING,
            description: "A detailed analysis in Persian of the primary sources of error. For networks, this MUST focus on channel loss (attenuation), repeater imperfections (swap fidelity, memory decoherence), and source/detector inefficiencies."
        },
        optimizationSuggestions: {
            type: Type.STRING,
            description: "Based on the error analysis, provide actionable suggestions in Persian for optimizing the network protocol or hardware parameters to improve performance."
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
      - The calculation of the Quantum Bit Error Rate (QBER) is critical. It must be based on a comparison between the sender's (Alice) and receiver's (Bob) sifted keys, factoring in channel noise and any eavesdropper (Eve) activity.
      - The 'securityAssessment' must be detailed, explaining whether Eve's presence was detectable from the QBER and why.
      - The 'keys' object must be populated with sample bit and basis strings for Alice, Bob, and Eve (if present) to illustrate the protocol's stages.
      - Other sections like detailed state vectors are secondary. Focus on the results relevant to security.`;
    case 'performance':
      return `
      *** Analysis Focus: NETWORK PERFORMANCE ***
      - Your primary objective is to evaluate the performance of this quantum network.
      - You MUST prioritize filling out the 'networkPerformance' and 'protocolTrace' sections of the JSON output. The protocol trace is mandatory.
      - Key metrics to calculate are: 'endToEndFidelity' of the shared quantum state, 'successProbability' of the entire protocol, 'keyRate' (if applicable), and 'latency'.
      - The 'protocolTrace' should log key events, especially probabilistic ones like photon loss in channels and entanglement swap failures/successes at repeaters.
      - The 'resultsAnalysis' and 'errorSourceAnalysis' must focus on how physical parameters (channel length, attenuation, repeater fidelity) directly impact the performance metrics. Provide a bottleneck analysis.`;
    case 'state':
      return `
      *** Analysis Focus: QUANTUM STATE ***
      - Your primary objective is a deep analysis of the quantum state of the system.
      - You MUST prioritize providing the most accurate and detailed 'finalStateVector' (ideal case) and 'densityMatrix' (noisy case).
      - The 'qubitStates' section must be filled for relevant qubits to enable Bloch sphere visualizations.
      - A detailed 'stepByStepExplanation' showing the evolution of the state vector after each major operation is highly preferred over a network-level 'protocolTrace'. If the network is complex, you may use 'protocolTrace' but include state information in its events.
      - The 'measurementProbabilities' (ideal) and 'measurementCounts' (noisy) are critical outputs.
      - Analysis should focus on the quantum mechanical properties of the final state (e.g., degree of entanglement, purity).`;
    case 'errorBudget':
      return `
      *** Analysis Focus: ERROR BUDGET & OPTIMIZATION ***
      - Your primary objective is to identify and quantify all significant sources of error in the network.
      - You MUST prioritize filling out the 'errorSourceAnalysis' and 'optimizationSuggestions' sections of the JSON output. These must be extremely detailed.
      - In 'errorSourceAnalysis', create a "budget" that attributes percentages of the total fidelity loss or QBER to specific components (e.g., "Channel 1 loss: 40% of errors", "Repeater 1 swap infidelity: 25% of errors", "Detector inefficiency: 15% of errors").
      - In 'optimizationSuggestions', provide concrete, actionable advice. For instance, "Reducing the attenuation on the 50km channel from 0.2 dB/km to 0.18 dB/km would yield the largest performance gain, improving end-to-end fidelity by an estimated 5%."
      - The 'resultsAnalysis' should also be framed from the perspective of how errors impacted the outcome.
      - Other sections like detailed theoretical background are less important.`;
    case 'educational':
      return `
      *** Analysis Focus: EDUCATIONAL EXPLANATION (FOR BEGINNERS) ***
      - Your primary objective is to explain the quantum network and its results in a simple, clear, and pedagogical manner, suitable for an absolute beginner or university undergraduate.
      - You MUST prioritize simple language. Use analogies to explain complex concepts. For example, 'superposition is like a spinning coin, it's both heads and tails at once until it lands'. 'Entanglement is like a pair of "magic" coins; if one lands heads, the other instantly becomes tails, no matter how far apart they are.'
      - **Define all key terms**: Explicitly define 'qubit', 'superposition', 'entanglement', 'measurement', etc., in the 'theoreticalBackground'.
      - **Explain the 'Why'**: In the 'protocolTrace' or 'stepByStepExplanation', don't just state what happens. Explain the *purpose* of each gate. For example: "The Hadamard gate is applied here to put the qubit into superposition, which is the crucial first step for creating entanglement."
      - The 'resultsAnalysis' must be simplified. Avoid jargon. Focus on the high-level meaning. For example, instead of a deep dive into the density matrix, explain *why* the final state is mixed (e.g., "Because some photons were lost in the fiber optic cable, our final entangled state isn't perfect. This imperfection, which we call a 'mixed' state, reduces the quality of our quantum connection.").
      - Omit highly technical data like the full 'densityMatrix' string unless it's essential to illustrate a key point, and if you do, explain what it represents. The ideal 'finalStateVector' is sufficient for most educational purposes.`;
    case 'comprehensive':
    default:
      return `
      *** Analysis Focus: COMPREHENSIVE ***
      - Your objective is to provide a complete and balanced report covering all aspects: network performance, security (if applicable), and detailed quantum state analysis.
      - Ensure all sections of the JSON schema are populated with high-quality, detailed information as appropriate for the given network. The 'protocolTrace' is mandatory for network simulations.`;
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
    1.  **Quantum Channels (Edges):** Each edge has 'length' (km) and 'attenuation' (dB/km) properties.
        -   You MUST calculate the photon survival probability for each channel using the formula: P_survival = 10^(-(attenuation * length) / 10).
        -   This probability determines if a qubit is lost during transmission, which is a primary source of error and latency (due to required retries).
    2.  **Repeater Nodes:** These nodes perform entanglement swapping. This is a probabilistic operation. You must model its 'swapFidelity', which degrades the quality of the entangled state even on success. Also consider its internal 'memoryT1'/'memoryT2' for decoherence if a qubit must be stored.
    3.  **End Nodes & Other Components:** Use the component-specific parameters provided in their 'data' objects (e.g., 'purity' for a source within an EndNode, 'efficiency' for a detector). These are high-priority. For any parameter not specified on a component, you may fall back to the global settings if provided.
    4.  **Simulation Goal:** The primary goal is usually to establish a high-fidelity entangled pair between two distant end nodes (e.g., Alice and Bob) or to execute a QKD protocol like BB84. Your entire analysis should revolve around the success and quality of this goal.
    5.  **Noise Model:** The simulation MUST be noisy, considering all the factors above (channel loss, gate/swap infidelity, decoherence). The global settings ('gateErrorProbability', 't1', 't2', etc.) should be applied as a baseline noise layer on top of the network-specific effects.
    
    *** Output Generation Instructions ***
    Your response MUST be a single JSON object that conforms to the provided schema.
    -   **protocolTrace / stepByStepExplanation:** Depending on the analysis mode, one of these is critical. For network-level analysis (performance, security, comprehensive), provide a detailed, chronological 'protocolTrace'. For 'state' analysis, a 'stepByStepExplanation' is preferred. The trace should log events like: "Alice's EndNode generates a pair," "Photon transmitted through Channel 1," "Photon is LOST in Channel 1 (Probabilistic event)," "Protocol restarts," "Repeater 1 attempts entanglement swap," "Swap succeeds but reduces fidelity to 0.92."
    -   **networkPerformance:** For relevant modes, you MUST calculate and provide the key network metrics. The 'endToEndFidelity' of the final distributed state is the most important output. For QKD, 'keyRate' is also essential.
    -   **resultsAnalysis & errorSourceAnalysis:** Your analysis must be from a NETWORK perspective. Explain HOW channel length, repeater fidelity, and other parameters contributed to the final performance metrics. For example: "The 100km total distance resulted in a low P_survival of 0.01, which was the main bottleneck for the key rate. The repeater's swap fidelity of 0.95 was the second-largest contributor to the final end-to-end fidelity drop."
    -   **measurementCounts:** Based on the noisy simulation, generate 'measurementCounts' for ${settings.shots} total shots. The distribution should reflect the final, imperfect state.
    -   **densityMatrix:** Provide the final density matrix for the end-to-end state (e.g., the 2-qubit state shared by Alice and Bob).

    *** QKD Protocol Analysis (if applicable) ***
    If the network implements a protocol like BB84:
    -   Your simulation must explicitly model the transmission, eavesdropping (if Eve is present), and sifting stages.
    -   The **QBER** calculation must be realistic, factoring in channel noise, detector dark counts, and Eve's disturbance.
    -   In 'securityAssessment', explain how the network's physical properties affect security. A long, lossy channel makes it harder to distinguish Eve's influence from natural noise.`;

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