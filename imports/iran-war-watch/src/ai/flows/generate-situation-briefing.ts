'use server';
/**
 * @fileOverview A Genkit flow that synthesizes multiple high-signal intelligence reports into a single, concise situation briefing for analysts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SituationBriefingInputSchema = z.object({
  articles: z.array(z.object({
    title: z.string(),
    description: z.string(),
    source: z.string(),
    score: z.number(),
    signalLevel: z.string(),
    category: z.string(),
  })).describe('The top intelligence reports to summarize.'),
});

const SituationBriefingOutputSchema = z.object({
  briefing: z.string().describe('A 2-3 sentence tactical executive summary.'),
  keyActionItems: z.array(z.string()).describe('List of 2-3 immediate recommended actions for the watch floor.'),
});

export type SituationBriefingOutput = z.infer<typeof SituationBriefingOutputSchema>;

const briefingPrompt = ai.definePrompt({
  name: 'situationBriefingPrompt',
  input: { schema: SituationBriefingInputSchema },
  output: { schema: SituationBriefingOutputSchema },
  prompt: `You are the Intelligence Watch Officer at the "Iran War Watch" Operations Center.
Synthesize the following reports into a Situation Briefing (SITREP) for the Command Team.

Incoming Intelligence:
{{#each articles}}
- [{{signalLevel}}] (Score: {{score}}) {{title}} (Source: {{source}})
{{/each}}

Objectives:
1. Identify cross-category escalatory patterns (e.g., Nuclear developments coinciding with Maritime aggression).
2. Highlight immediate tactical risks to regional stability.
3. Provide actionable focus areas for analysts (Action Items).

Keep the summary clinical, professional, and dense.`,
});

export async function generateSituationBriefing(input: z.infer<typeof SituationBriefingInputSchema>): Promise<SituationBriefingOutput> {
  const { output } = await briefingPrompt(input);
  return output!;
}
