export type SignalLevel = 'low' | 'medium' | 'high' | 'critical';
export type Category = 'Conflict' | 'Nuclear' | 'Maritime/Energy';
export type ArticleType = 'Event Report' | 'Analysis' | 'Opinion' | 'Official Statement' | 'Noise';
export type ReviewStatus = 'pending' | 'reviewed' | 'flagged';

export interface ScoreBreakdown {
  keywordRelevance: number;
  sourceCredibility: number;
  contentUrgency: number;
  recencyWeight: number;
}

export interface Article {
  id: string;
  title: string;
  source: string;
  author?: string;
  publishedAt: string;
  url: string;
  description: string;
  content: string;
  matchedKeywords: string[];
  score: number;
  scoreBreakdown: ScoreBreakdown;
  signalLevel: SignalLevel;
  articleType: ArticleType;
  status: ReviewStatus;
  aiSummary?: string;
  whyFlagged: string;
  category: Category;
  duplicateOfId?: string;
  imageUrl?: string;
}

export interface WatchlistGroup {
  id: Category;
  keywords: string[];
}

export interface AppSettings {
  trustedSources: string[];
  scoringWeights: {
    keywordMatch: number;
    recency: number;
    sourceTrust: number;
  };
  watchlists: WatchlistGroup[];
}

export interface BriefingState {
  text: string;
  actionItems: string[];
  isGenerating: boolean;
}
