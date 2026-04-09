import type { BoardState } from './types';

const initialForecast: BoardState['forecast'] = {
    risks: [
        { id: "f-risk-1", title: "Escalation risk", value: 51, description: "Pressure, tempo, and low restraint are combining here." },
        { id: "f-risk-2", title: "Framework closure", value: 62, description: "Closure now depends on cooperation residue surviving actor tension." },
        { id: "f-risk-3", title: "Coalition fragmentation", value: 39, description: "Trust residue and pressure determine whether alignment can hold." },
        { id: "f-risk-4", title: "Autonomous snap", value: 36, description: "The chance that the board breaks without a clean deliberate order." },
    ],
    microForecasts: [
        { id: "mf-1", title: "A new 'narrative' incident will form.", probability: 45, description: "With narrative drift increasing, misinterpretation or deliberate information plays are likely to create new, distinct incidents.", timeHorizon: "3-5 cycles", drivers: ["High narrative drift", "Low cooperation residue"] },
        { id: "mf-2", title: "The 'Framework fracture' tripwire will move to 'approaching'.", probability: 30, description: "If cooperation levels continue to fall while a major incident is active, the conditions for this tripwire will be met.", timeHorizon: "5-10 cycles", drivers: ["Falling cooperation level", "Active high-threat incident"] },
        { id: "mf-3", title: "Top incident's attention score will increase.", probability: 60, description: "The current top incident shows characteristics of escalation, and further linked events are likely.", timeHorizon: "1-3 cycles", drivers: ["High escalation pressure"] },
    ]
};

export const initialState: BoardState = {
    title: "Fracture Board",
    status: ["v4 Emergent", "Red / dual-chokepoint active", "nonlinear pressure online", "memory tracking engaged"],
    subtitle: "Living Watchboard System",
    description: "An emergent model where actors react to each other, memory reshapes incentives, and nonlinear pressure can snap the board without direct input.",
    supervisorBrief: "System is initializing. The board is evaluating initial inputs to establish a baseline state.",
    redTeamNote: "Initial state has high uncertainty. Key assumptions about actor intent and capabilities have not been tested.",
    compositeState: {
        title: "Composite state",
        description: "Constrained escalation under negotiation pressure",
        stabilityIndex: 0.9,
        stabilityTrend: 'stable',
        scoreDescription: "System is highly stable and resilient to shocks.",
        throughputCollapse: 3,
        frameworkVisibility: 75,
    },
    modules: [
        { id: "context-engine", icon: "🧭", title: "Context Engine", status: "Narrative drift active", reliability: 59, description: "Tracks timeline compression, continuity vs change, and whether the story actors tell is converging or splitting under pressure.", layer: 'narrative' },
        { id: "kinetic-feed", icon: "🔥", title: "Kinetic Feed", status: "High but disciplined tempo", reliability: 91, description: "Reads strikes, launches, interceptions, and whether tempo is still bounded or starting to outrun the system’s ability to absorb it.", layer: 'reality' },
        { id: "decision-layer", icon: "👤", title: "Decision Layer", status: "Actors still shapeable", reliability: 72, description: "Tracks who can still move the board, who is reacting defensively, and whether the actor network is still governable.", layer: 'narrative' },
        { id: "reality-anchor", icon: "🌍", title: "Reality Anchor", status: "Ground truth severe", reliability: 97, description: "Keeps the board tied to physical effects: infrastructure, flow, rerouting, and whether public pressure is beginning to compress decision time.", layer: 'reality' },
        { id: "gameboard", icon: "♟️", title: "Gameboard", status: "Coalition stress visible", reliability: 54, description: "Maps coalition splits, chokepoints, carve-outs, and whether the system is still aligned enough to produce collective outcomes.", layer: 'narrative' },
        { id: "absence-detector", icon: "🚫", title: "Absence Detector", status: "Restraint pattern confirmed", reliability: 85, description: "Flags the severe things that still are not happening. In this board, withheld catastrophe is often the strongest signal in the room.", layer: 'reality' },
    ],
    agentStates: [
        { id: 'triage', name: 'Triage Agent', reliability: 80, scores: { precision: 85, usefulness: 70, calibration: 80 } },
        { id: 'cluster', name: 'Cluster Agent', reliability: 85, scores: { precision: 80, usefulness: 90, calibration: 85 } },
        { id: 'redTeam', name: 'Red Team Agent', reliability: 70, scores: { precision: 70, usefulness: 75, calibration: 65 } },
        { id: 'forecast', name: 'Forecast Agent', reliability: 65, scores: { precision: 60, usefulness: 65, calibration: 70 } },
        { id: 'supervisorBrief', name: 'Briefing Agent', reliability: 75, scores: { precision: 75, usefulness: 75, calibration: 75 } },
    ],
    synthesis: {
        title: "Emergent architecture",
        description: "System synthesis / Cross-module readout",
        items: [
            { id: "composite-posture", title: "Composite posture", subtitle: "High violence, bounded edge", description: "The system reads not peace, but bounded escalation. The edge is still there. It just has not been crossed." },
            { id: "memory-effect", title: "Memory effect", subtitle: "Cooperation residue still matters", description: "The board still has positive residue to work with. That is one reason restraint has not collapsed already." },
            { id: "best-current-edge", title: "Best current edge", subtitle: "Negative-space intelligence + reaction mapping", description: "The strongest signal is not just what happened. It is which actor moves triggered which follow-on reactions — and what still remains conspicuously unused." },
        ],
    },
    influenceNetwork: {
        title: "Influence network",
        description: "Decision layer / Actors reacting to actors",
        actors: [
            { id: "dermer", name: "Dermer", power: 92, description: "High leverage because he can convert structure into closure — or delay it for tactical sequencing.", actions: [{label: "Push Deal", type: "primary"}, {label: "Delay for leverage", type: "secondary"}, {label: "Framework gatekeeper", type: "secondary"}] },
            { id: "iran-channel", name: "Iran Channel", power: 88, description: "Can preserve restraint while simultaneously keeping escalation capacity visible.", actions: [{label: "Signal Restraint", type: "primary"}, {label: "Proxy Surge", type: "secondary"}, {label: "Lebanon bridge", type: "secondary"}] },
            { id: "french-mediation", name: "French Mediation", power: 76, description: "Lower coercive power, but disproportionately important when synchronization is the bottleneck.", actions: [{label: "Bridge Gap", type: "primary"}, {label: "Escalation driver", type: "secondary"}] },
            { id: "hardliners", name: "Hardliners", power: 61, description: "Seeks maximum pressure even when system stress is already compounding.", actions: [{label: "Demand Strike", type: "primary"}] },
        ]
    },
    memory: {
        title: "System memory and residue",
        description: "Memory engine",
        residue: { cooperation: 25, betrayal: 20, shock: 15 },
        history: [{
            timestamp: new Date().toISOString(),
            summary: "System initialized. Agentic loop standing by.",
            pulse: {
                kineticTempo: { value: 4, trend: 'stable', description: 'Recent high-severity military events.' },
                narrativeDrift: { value: 6, trend: 'stable', description: 'Contradictions between statements and actions.' },
                escalationPressure: { value: 7, trend: 'stable', description: 'Rate and severity of new incidents.' },
                cooperationLevel: { value: 3, trend: 'stable', description: 'Presence of de-escalation events and cooperation residue.' },
                uncertainty: { value: 5, trend: 'stable', description: 'Average confidence of incoming signals and skeptic flags.' },
            },
            stabilityIndex: 0.9,
            forecast: initialForecast
        }],
    },
    edgeCases: {
        title: "Edge Case Detector",
        description: "Tracking rare, high-impact events and non-events that could indicate a state change.",
        items: [
            { id: "edge-1", title: "Edge Case: Critical Absence", subtitle: "Desalination strike threshold still withheld", description: "A high-impact, non-event. The continued withholding of this action is a strong signal of strategic restraint, but its use would represent a major escalation." },
            { id: "edge-2", title: "Edge Case: Strategic Absence", subtitle: "Commercial shipping still not fully re-targeted", description: "The dual-chokepoint structure is live, but not fully operationalized. This gap between capability and action is a key indicator of intent." },
            { id: "edge-3", title: "Edge Case: Narrative/Kinetic Divergence", subtitle: "High narrative aggression, low kinetic follow-through", description: "Actors are using aggressive rhetoric not backed by immediate action. This could be posturing, deception, or a precursor to a surprise move." }
        ]
    },
    contradictions: {
        title: "Narrative Drift",
        description: "Contradiction Detector / Statements vs Actions",
        items: [],
    },
    quarantine: {
        title: "Quarantined Signals",
        description: "Signals that fall below the minimum confidence threshold for entry into the system.",
        items: [],
    },
    tripwires: {
        title: "Snap thresholds",
        description: "Tripwire ladder / Immediate watchpoints",
        items: [
            { id: 'tw1', title: "Civilian desalination infrastructure hit", description: "Immediate humanitarian escalation with intervention pressure.", status: 'inactive' },
            { id: 'tw2', title: "Commercial shipping campaign resumes", description: "This fully operationalizes the dual-chokepoint scenario.", status: 'inactive' },
            { id: 'tw3', title: "Framework fracture", description: "A side theater becomes the structural bottleneck.", status: 'inactive' },
            { id: 'tw4', title: "Autonomous trigger", description: "The system no longer needs a deliberate actor move to break.", status: 'inactive' },
        ]
    },
    emergingSignals: {
        title: "Emerging Signals",
        description: "Anomalies and novel events that may indicate future shifts.",
        items: [],
    },
    simulationLab: {
        title: "Simulation Lab",
        description: "Manually inject scenarios and shocks to test system resilience and explore alternative futures.",
    },
    systemReflection: {
        title: "System Reflection",
        description: "Meta-analysis of the board's own performance and limitations.",
        items: [
            { id: "sr-1", title: "System Health", content: "Agent reliability scores are stable. No significant model drift detected. Data pipeline is nominal." },
            { id: "sr-2", title: "Potential Blindspots", content: "The system relies heavily on public state media and kinetic feeds. Covert or non-state actor activities may be underrepresented." },
            { id: "sr-3", title: "Known Unknowns", content: "The true intent behind the 'Ally Breaks Ranks' event is still ambiguous. It could be a genuine policy shift or a calculated deception." }
        ]
    },
    missReview: {
        title: "Agent Miss Review",
        description: "A log of instances where agent analysis failed, and the corrective adjustments made by the system.",
        reports: [],
    },
    operatorIntent: {
        priority: 'stability',
        riskTolerance: 'medium',
        timeHorizon: 'medium',
    },
    forecast: initialForecast,
    timeline: {
        title: "Seven-day state progression",
        description: "Context engine / Narrative + structure",
        ticks: [
            { id: 60, tick: 60, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 59, tick: 59, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 58, tick: 58, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 57, tick: 57, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 56, tick: 56, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 55, tick: 55, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 54, tick: 54, e: "E9.0", restraint: "0.90", pressure: "0.45" },
            { id: 53, tick: 53, e: "E9.0", restraint: "0.90", pressure: "0.46" },
        ]
    },
    terminal: {
        title: "Emergent Event Stream",
        description: "Reaction feed & live causal log",
        pressureIndex: 43,
        actorTension: 42,
        memoryBurden: { cooperation: 43, betrayal: 12, shock: 7 },
    },
    globalPulse: {
        kineticTempo: { value: 4, trend: 'stable', description: 'Recent high-severity military events.' },
        narrativeDrift: { value: 6, trend: 'stable', description: 'Contradictions between statements and actions.' },
        escalationPressure: { value: 7, trend: 'stable', description: 'Rate and severity of new incidents.' },
        cooperationLevel: { value: 3, trend: 'stable', description: 'Presence of de-escalation events and cooperation residue.' },
        uncertainty: { value: 5, trend: 'stable', description: 'Average confidence of incoming signals and skeptic flags.' },
    },
    incidents: [],
    events: [],
    eventLog: [{ agent: "System", message: "System initialized. Agentic loop standing by.", timestamp: new Date().toISOString() }],
    processedGuids: [],
    lastAgentOutputs: {
        collector: null,
        triage: null,
        cluster: null,
        redTeam: null,
        supervisorBrief: null,
        forecast: null,
    },
    causalLinks: [],
    calibration: {
        title: "System Calibration",
        description: "Tracks the forecasting performance of the system over time to identify and correct for biases like over or underconfidence.",
        overconfidenceScore: 15,
        underconfidenceScore: 22,
        history: [
            {
                id: 'cal-1',
                hypothesisTitle: 'Imminent Escalation',
                predictedProbability: 25,
                outcome: 'denied',
                notes: 'De-escalation event occurred, contradicting the forecast.',
                timestamp: new Date().toISOString(),
            }
        ]
    },
};
