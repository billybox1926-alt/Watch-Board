export type StatusLevel = "Red" | "Amber" | "Mixed" | "Watching" | "Active" | "Tripwire" | "Critical" | "Green";

export interface MetricCard {
  id: string;
  title: string;
  value: string;
  status: StatusLevel;
  delta?: string;
}

export interface PulseItem {
  id: string;
  text: string;
  status: StatusLevel;
  timestamp: string;
  section?: string;
}

export interface IntelCard {
  id: string;
  title: string;
  status: StatusLevel;
  summary: string;
  interpretation?: string;
  evidence?: string[];
  category?: string;
  signalMatters?: string;
}

export interface TripwireItem {
  id: string;
  title: string;
  status: StatusLevel;
  description: string;
  whyItMatters: string;
  implication: string;
  boardChange: string;
  direction: "escalation" | "downgrade" | "ambiguous";
}

export interface PropagationStage {
  id: string;
  stage: number;
  title: string;
  description: string;
  status: StatusLevel;
  latency: string;
  coupling: string;
  active?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  consequences: {
    shipping: string;
    oil: string;
    diplomacy: string;
    industrial: string;
    escort: string;
  };
  likelihood: StatusLevel;
  severityScores?: {
    shipping: number;
    oil: number;
    diplomacy: number;
    industrial: number;
    escort: number;
  };
}

export interface Snapshot {
  id: string;
  title: string;
  timestamp: string;
  note: string;
  posture: StatusLevel;
  whatChanged?: string;
}

export interface DecisiveQuestion {
  id: string;
  question: string;
  status: StatusLevel;
  answer?: string;
}

export interface DeltaItem {
  id: string;
  text: string;
  timestamp: string;
  direction: "up" | "down" | "neutral";
}

export interface FalsificationTest {
  id: string;
  test: string;
  status: StatusLevel;
  result: string;
}
