
import { Article, AppSettings } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  trustedSources: ['Reuters', 'Associated Press', 'BBC News', 'Al Jazeera', 'The New York Times', 'Lloyds List'],
  scoringWeights: {
    keywordMatch: 10,
    recency: 5,
    sourceTrust: 20
  },
  watchlists: [
    {
      id: 'Conflict',
      keywords: ['Missile', 'IRGC', 'Drone Strike', 'Hezbollah', 'IDF', 'Troop Movement', 'Cyber Attack']
    },
    {
      id: 'Nuclear',
      keywords: ['Centrifuge', 'Uranium', 'IAEA', 'Enrichment', 'Natanz', 'Fordow', 'Arak']
    },
    {
      id: 'Maritime/Energy',
      keywords: ['Strait of Hormuz', 'Oil Tanker', 'Ship Seizure', 'Brent Crude', 'Vessel', 'Sanctions']
    }
  ]
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'IAEA Reports Increase in 60% Enriched Uranium Stockpiles at Natanz',
    source: 'Associated Press',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    url: '#',
    description: 'International nuclear watchdogs confirm that Iran has significantly increased its reserves of near-weapons grade material, raising regional concerns.',
    content: 'Full content analysis here...',
    matchedKeywords: ['IAEA', 'Uranium', 'Enrichment', 'Natanz'],
    score: 96,
    scoreBreakdown: {
      keywordRelevance: 40,
      sourceCredibility: 30,
      contentUrgency: 20,
      recencyWeight: 6
    },
    signalLevel: 'critical',
    articleType: 'Official Statement',
    status: 'pending',
    whyFlagged: 'Direct IAEA report confirming weapons-grade enrichment escalation at a primary facility.',
    category: 'Nuclear',
    imageUrl: 'https://picsum.photos/seed/nuclear1/600/400'
  },
  {
    id: '2',
    title: 'New Satellite Imagery Shows Expansion at Iranian Missile Facility near Tehran',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    url: '#',
    description: 'High-resolution images reveal significant construction progress at a known ballistic missile production site, likely for solid-fuel variants.',
    content: 'Full intelligence breakdown...',
    matchedKeywords: ['Missile', 'IRGC'],
    score: 88,
    scoreBreakdown: {
      keywordRelevance: 30,
      sourceCredibility: 25,
      contentUrgency: 20,
      recencyWeight: 13
    },
    signalLevel: 'high',
    articleType: 'Event Report',
    status: 'pending',
    whyFlagged: 'Verified expansion of missile production capabilities by the IRGC.',
    category: 'Conflict',
    imageUrl: 'https://picsum.photos/seed/conflict1/600/400'
  },
  {
    id: '3',
    title: 'Oil Tanker Diverts Course Following Suspicious Approach in Gulf of Oman',
    source: 'Maritime News',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    url: '#',
    description: 'A Marshall Islands-flagged tanker reported being approached by fast boats while transiting the key waterway near the Strait of Hormuz.',
    content: 'Operational report...',
    matchedKeywords: ['Oil Tanker', 'Strait of Hormuz'],
    score: 72,
    scoreBreakdown: {
      keywordRelevance: 25,
      sourceCredibility: 15,
      contentUrgency: 15,
      recencyWeight: 17
    },
    signalLevel: 'medium',
    articleType: 'Event Report',
    status: 'pending',
    whyFlagged: 'Operational disruption in key energy transit route involving suspicious maritime activity.',
    category: 'Maritime/Energy',
    imageUrl: 'https://picsum.photos/seed/maritime1/600/400'
  },
  {
    id: '4',
    title: 'Tanker Alert: Suspicious Vessel Activity near Hormuz',
    source: 'Lloyds List',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    url: '#',
    description: 'Similar reports emerging of fast boats shadowing commercial traffic near the Strait. Corroborating incident reports from regional security teams.',
    content: 'Shipping alert details...',
    matchedKeywords: ['Oil Tanker', 'Strait of Hormuz'],
    score: 70,
    scoreBreakdown: {
      keywordRelevance: 25,
      sourceCredibility: 15,
      contentUrgency: 15,
      recencyWeight: 15
    },
    signalLevel: 'medium',
    articleType: 'Event Report',
    status: 'pending',
    duplicateOfId: '3',
    whyFlagged: 'Corroborating report for event #3. Identified as potential duplicate by engine.',
    category: 'Maritime/Energy',
    imageUrl: 'https://picsum.photos/seed/maritime2/600/400'
  },
  {
    id: '5',
    title: 'Potential De-escalation Paths in the Middle East Analysis',
    source: 'Analysis Weekly',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: '#',
    description: 'Long-form piece exploring various diplomatic avenues to reduce current tensions between regional powers.',
    content: 'Strategic outlook...',
    matchedKeywords: ['Sanctions'],
    score: 42,
    scoreBreakdown: {
      keywordRelevance: 10,
      sourceCredibility: 10,
      contentUrgency: 5,
      recencyWeight: 17
    },
    signalLevel: 'low',
    articleType: 'Analysis',
    status: 'reviewed',
    whyFlagged: 'Strategic analysis with low immediate tactical significance, focuses on long-term policy.',
    category: 'Conflict',
    imageUrl: 'https://picsum.photos/seed/conflict2/600/400'
  }
];
