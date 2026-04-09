'use server';

/**
 * @fileOverview This file implements the "Scoring Engine" for Iran War Watch.
 * It classifies articles into types and provides a granular score breakdown.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScoringEngineInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  source: z.string(),
  content: z.string(),
  matchedKeywords: z.array(z.string()),
});

const ScoringEngineOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('Total relevance score.'),
  articleType: z.enum(['Event Report', 'Analysis', 'Opinion', 'Official Statement', 'Noise']),
  breakdown: z.object({
    keywordRelevance: z.number().describe('Score based on specific watchlist matches (0-40).'),
    sourceCredibility: z.number().describe('Score based on publisher history (0-30).'),
    contentUrgency: z.number().describe('Score based on tone and immediacy (0-20).'),
    recencyWeight: z.number().describe('Score adjustment for time of publication (0-10).'),
  }),
  explanation: z.string().describe('Professional analyst breakdown of why the specific score was assigned.'),
});

export type ScoringEngineOutput = z.infer<typeof ScoringEngineOutputSchema>;

const scoringPrompt = ai.definePrompt({
  name: 'scoringEnginePrompt',
  input: { schema: ScoringEngineInputSchema },
  output: { schema: ScoringEngineOutputSchema },
  prompt: `You are a Senior Strategic Intelligence Analyst. Analyze the following news item and categorize its tactical significance.

Classification Guide:
- Event Report: Factual, real-time reporting of kinetic or diplomatic events.
- Analysis: Contextual assessment or long-term forecasting.
- Opinion: Editorialized content or non-expert viewpoints.
- Official Statement: Direct transcripts or press releases from government bodies (MFA, IRGC, US State Dept).
- Noise: Tangential or redundant information.

Scoring Criteria (0-100 total):
1. Keyword Relevance (max 40): Match against strategic watchlist items.
2. Source Credibility (max 30): Weighted by historical accuracy of the source.
3. Content Urgency (max 20): Tone indicators of imminent escalation or high-impact policy shifts.
4. Recency (max 10): Temporal relevance to current shifting theater dynamics.

Article:
Title: {{{title}}}
Source: {{{source}}}
Keywords: {{#each matchedKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Description: {{{description}}}

Provide a professional 'explanation' summarizing the intelligence value. Return the breakdown and total score in JSON format.`,
});

export async function scoreArticle(input: z.infer<typeof ScoringEngineInputSchema>): Promise<ScoringEngineOutput> {
  const { output } = await scoringPrompt(input);
  return output!;
}
