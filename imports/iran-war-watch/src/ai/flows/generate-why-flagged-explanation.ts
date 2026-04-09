'use server';
/**
 * @fileOverview A Genkit flow for generating an AI-powered explanation detailing why a news article was flagged, its assigned score, and signal level.
 *
 * - generateWhyFlaggedExplanation - A function that generates the explanation for a flagged article.
 * - GenerateWhyFlaggedExplanationInput - The input type for the generateWhyFlaggedExplanation function.
 * - GenerateWhyFlaggedExplanationOutput - The return type for the generateWhyFlaggedExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWhyFlaggedExplanationInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  description: z.string().describe('A brief description or summary of the article content.'),
  matchedKeywords: z.array(z.string()).describe('A list of keywords from the watchlist that were found in the article.').default([]),
  source: z.string().describe('The source publication of the article.'),
  score: z.number().describe('The relevance score assigned to the article (0-100).'),
  signalLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('The signal level assigned to the article based on its significance.'),
  category: z.enum(['Conflict', 'Nuclear', 'Maritime/Energy']).describe('The keyword category this article primarily falls under.'),
});
export type GenerateWhyFlaggedExplanationInput = z.infer<typeof GenerateWhyFlaggedExplanationInputSchema>;

const GenerateWhyFlaggedExplanationOutputSchema = z.object({
  explanation: z.string().describe('A clear, AI-generated explanation detailing why the article was flagged, its score, and signal level.'),
});
export type GenerateWhyFlaggedExplanationOutput = z.infer<typeof GenerateWhyFlaggedExplanationOutputSchema>;

export async function generateWhyFlaggedExplanation(input: GenerateWhyFlaggedExplanationInput): Promise<GenerateWhyFlaggedExplanationOutput> {
  return generateWhyFlaggedExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'whyFlaggedExplanationPrompt',
  input: { schema: GenerateWhyFlaggedExplanationInputSchema },
  output: { schema: GenerateWhyFlaggedExplanationOutputSchema },
  prompt: `You are an intelligent assistant for the 'Iran War Watch' analyst dashboard. Your task is to provide a concise, clear, and professional explanation for why a news article was flagged, detailing its assigned score and signal level.

Synthesize information from the article's title, description, matched keywords, source, score, and signal level into a coherent explanation. Emphasize the key elements that contributed to its flagging and assessment.

Article Details:
Title: {{{title}}}
Description: {{{description}}}
Source: {{{source}}}
Matched Keywords: {{#each matchedKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Score: {{{score}}}
Signal Level: {{{signalLevel}}}
Category: {{{category}}}

Provide the explanation in the 'explanation' field of the output JSON. Focus on clarity and the system's reasoning.`,
});

const generateWhyFlaggedExplanationFlow = ai.defineFlow(
  {
    name: 'generateWhyFlaggedExplanationFlow',
    inputSchema: GenerateWhyFlaggedExplanationInputSchema,
    outputSchema: GenerateWhyFlaggedExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
