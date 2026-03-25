export type SignalLevel = 'low' | 'medium' | 'high' | 'critical';
export type KeywordGroup = 'Conflict' | 'Nuclear' | 'Maritime/Energy' | 'Intelligence' | 'Economy' | 'Cyber' | 'Diplomacy' | 'Internal Security';
export type ThreatTrajectory = 'rising' | 'stable' | 'falling';

export interface Article {
  id: string;
  title: string;
  source: string;
  author: string | null;
  publishedAt: string; // ISO Date string
  url: string;
  description: string;
  content: string;
  matchedKeywords: string[];
  score: number;
  signalLevel: SignalLevel;
  aiSummary: string;
  whyFlagged: string[];
  category: KeywordGroup;
  duplicateGroup: string | null;
  // Upgrade fields
  sentiment: 'negative' | 'neutral' | 'positive';
  reliability: number; // 0-1
  trajectory: ThreatTrajectory;
  location?: { lat: number; lng: number; label: string };
}
