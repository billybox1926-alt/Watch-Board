import type { RawSignal, Event, Module, ConfidenceBreakdown, OperatorIntent } from '@/lib/types';
export interface Module {
  id: string;
  icon: string;
  title: string;
  status: string;
  reliability: number;
  description: string;
  layer: 'narrative' | 'reality';
}

export interface DecisionActorAction {
  label: string;
  type: 'primary' | 'secondary';
}

export interface DecisionActor {
  id: string;
  name: string;
  power: number;
  description: string;
  actions: DecisionActorAction[];
}

export interface MemoryResidue {
    cooperation: number;
    betrayal: number;
    shock: number;
}

export interface Tripwire {
    id:string;
    title: string;
    description: string;
    status: 'inactive' | 'approaching' | 'triggered';
}

export interface ForecastRisk {
    id: string;
    title: string;
    value: number;
    description: string;
}

export interface MicroForecast {
    id: string;
    title: string;
    probability: number;
    description: string;
    drivers?: string[];
    timeHorizon?: string;
}

export interface TimelineTick {
    id: number;
    tick: number;
    e: string;
    restraint: string;
    pressure: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  linkedEvents: string[];
  actors: string[];
  domains: (
    | 'military'
    | 'economic'
    | 'narrative'
    | 'diplomatic'
    | 'infrastructure'
  )[];
  attentionScore: number;
  lastUpdated: string;
}

export interface PulseMetric {
    value: number;
    trend: 'up' | 'down' | 'stable';
    description: string;
}

export interface GlobalPulse {
    kineticTempo: PulseMetric;
    narrativeDrift: PulseMetric;
    escalationPressure: PulseMetric;
    cooperationLevel: PulseMetric;
    uncertainty: PulseMetric;
}

export interface AgentLogEntry {
    timestamp: string;
    agent: string;
    message: string;
}

export interface MemoryRecord {
    timestamp: string;
    summary: string;
    pulse: GlobalPulse;
    stabilityIndex: number;
    forecast: {
        risks: ForecastRisk[];
        microForecasts: MicroForecast[];
    };
}

export interface Contradiction {
    id: string;
    actor: string;
    statement: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High';
    timestamp: string;
}

export interface CausalLink {
    from: string; // event id
    to: string; // event id
    strength: number;
    type: 'trigger' | 'escalation' | 'suppression' | 'influence';
}

export interface EmergingSignal {
    id: string;
    eventId: string;
    title: string;
    summary: string;
    score: number; // The novelty score
    timestamp: string;
}

export interface AgentState {
    id: string;
    name: string;
    reliability: number; // Weighted composite score
    scores: {
        precision: number; // Correctness
        usefulness: number; // Did it add value?
        calibration: number; // Confidence vs reality
    };
}

export interface CalibrationRecord {
    id: string;
    hypothesisTitle: string;
    predictedProbability: number;
    outcome: 'confirmed' | 'denied' | 'unresolved';
    notes: string;
    timestamp: string;
}

export interface OperatorIntent {
    priority: 'escalation' | 'diplomacy' | 'stability' | 'all';
    riskTolerance: 'low' | 'medium' | 'high';
    timeHorizon: 'short' | 'medium' | 'long';
}

export interface MissReport {
    id: string;
    agentName: 'Forecast' | 'Red Team' | 'Briefing';
    whatWasWrong: string;
    whyItHappened: string;
    adjustmentMade: string;
    timestamp: string;
}

export interface MissReview {
    title: string;
    description: string;
    reports: MissReport[];
}

export interface BoardState {
    title: string;
    status: string[];
    subtitle: string;
    description: string;
    supervisorBrief: string | null;
    redTeamNote: string | null;
    compositeState: {
        title: string;
        description: string;
        stabilityIndex: number; // 0-1
        stabilityTrend: 'up' | 'down' | 'stable';
        scoreDescription: string;
        throughputCollapse: number;
        frameworkVisibility: number;
    };
    modules: Module[];
    agentStates: AgentState[];
    synthesis: {
        title: string;
        description: string;
        items: { id: string, title: string; subtitle: string; description: string }[];
    };
    influenceNetwork: {
        title: string;
        description: string;
        actors: DecisionActor[];
    };
    memory: {
        title: string;
        description: string;
        residue: MemoryResidue;
        history: MemoryRecord[];
    };
    edgeCases: {
        title: string;
        description: string;
        items: { id: string, title: string, subtitle: string, description: string }[]
    };
    contradictions: {
        title: string;
        description: string;
        items: Contradiction[];
    };
    tripwires: {
        title: string;
        description: string;
        items: Tripwire[];
    };
    emergingSignals: {
        title: string;
        description: string;
        items: EmergingSignal[];
    };
    simulationLab: {
        title: string;
        description: string;
    };
    quarantine: {
        title: string;
        description: string;
        items: RawSignal[];
    };
    systemReflection: {
        title: string;
        description: string;
        items: {
            id: string;
            title: string;
            content: string;
        }[];
    };
    missReview: MissReview;
    operatorIntent: OperatorIntent;
    forecast: {
        risks: ForecastRisk[];
        microForecasts: MicroForecast[];
    };
    timeline: {
        title: string;
        description: string;
        ticks: TimelineTick[];
    };
    terminal: {
        title: string,
        description: string,
        pressureIndex: number;
        actorTension: number;
        memoryBurden: MemoryResidue;
    };
    globalPulse: GlobalPulse;
    incidents: Incident[];
    events: Event[];
    eventLog: AgentLogEntry[];
    lastAgentOutputs: { [agentName: string]: any };
    causalLinks: CausalLink[];
    calibration: {
        title: string;
        description: string;
        overconfidenceScore: number; // 0 to 100
        underconfidenceScore: number; // 0 to 100
        history: CalibrationRecord[];
    };
    processedGuids?: string[];
}

// Agent-related types
export interface RawSignal {
    source: string; // e.g., 'Kinetic Feed', 'Decision Layer'
    content: string;
    actor?: string | string[];
    domain?: 'military' | 'economic' | 'narrative' | 'diplomatic' | 'infrastructure';
    location?: string;
    title?: string;
    guid?: string;
    timestamp?: string;
}

export interface ConfidenceBreakdown {
    sourceReliability: number;
    assertionStrength: number;
}

export interface Event {
  id: string; // uuid
  timestamp: string; // ISO
  source: string;
  actor: string | string[];
  domain: 'military' | 'economic' | 'narrative' | 'diplomatic' | 'infrastructure';
  location: string;
  title: string;
  description: string;
  severity: number; // 0-1
  confidence: number; // 0-1
  confidenceBreakdown?: ConfidenceBreakdown;
  novelty: number; // 0-1
  dependencies: string[]; // array of event ids
  tags: string[];
  skepticFeedback?: string;
  guid?: string;
}

export interface SupervisorUpdate {
    logs: AgentLogEntry[];
    newState: Partial<BoardState>;
}
