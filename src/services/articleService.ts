import type { Article, SignalLevel } from '../types/article';
import type { RawArticle } from './mockData';
import { differenceInHours, parseISO } from 'date-fns';

export const calculateSignalLevel = (score: number): SignalLevel => {
  if (score >= 90) return 'critical';
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

export const processArticle = (
  article: RawArticle,
  trustedSources: string[],
  weights: { keywordMatch: number; recency: number; trustedSource: number }
): Article => {
  let score = 0;
  const whyFlagged: string[] = [];

  // Use existing analytics from raw data for purity
  const sentiment = article.sentiment;
  const reliability = article.reliability;
  const trajectory = article.trajectory;

  // 1. Keyword Matches (Up to keywordMatch weight)
  const kwScore = Math.min((article.matchedKeywords.length / 5), 1) * weights.keywordMatch;
  score += kwScore;
  if (kwScore > 0) {
    whyFlagged.push(`Matched ${article.matchedKeywords.length} keywords`);
  }

  // 2. Recency (Up to recency weight)
  const hoursOld = differenceInHours(new Date(), parseISO(article.publishedAt));
  let recencyScore = 0;
  if (hoursOld < 24) {
    // Linear decay over 24 hours
    recencyScore = ((24 - hoursOld) / 24) * weights.recency;
    score += recencyScore;
    whyFlagged.push(`Recent event (${hoursOld}h old)`);
  }

  // 3. Trusted Source (Up to trustedSource weight)
  if (trustedSources.includes(article.source)) {
    score += weights.trustedSource;
    whyFlagged.push(`Trusted source (${article.source})`);
  }

  // Final score out of 100
  score = Math.min(Math.round(score), 100);

  return {
    ...article,
    score,
    signalLevel: calculateSignalLevel(score),
    whyFlagged,
    sentiment,
    reliability,
    trajectory,
    location: article.location
  };
};

export const getTopDevelopments = (articles: Article[]): Article[] => {
  return [...articles]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};
