'use server';

/**
 * @fileOverview This file implements a Genkit flow for classifying the significance of news articles related to the Iran conflict.
 * It assigns a 'signalLevel' and provides an 'explanation' based on article content, keywords, and source credibility.
 *
 * - classifyArticleSignificance - The main function to classify article significance.
 * - ArticleSignificanceClassificationInput - The input type for the classification function.
 * - ArticleSignificanceClassificationOutput - The return type for the classification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema for the article significance classification
const ArticleSignificanceClassificationInputSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  description: z.string().optional().describe('A short description or summary of the article.'),
  content: z.string().describe('The full content of the news article.'),
  matchedKeywords: z.array(z.string()).describe('A list of keywords from the watchlist that were found in the article.'),
  source: z.string().describe('The source name of the news article (e.g., "Reuters", "BBC News").')
});

export type ArticleSignificanceClassificationInput = z.infer<typeof ArticleSignificanceClassificationInputSchema>;

// Output Schema for the article significance classification
const ArticleSignificanceClassificationOutputSchema = z.object({
  signalLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('The classified significance level of the article.'),
  explanation: z.string().describe('A concise explanation (1-2 sentences) for the assigned signal level.')
});

export type ArticleSignificanceClassificationOutput = z.infer<typeof ArticleSignificanceClassificationOutputSchema>;

// Prompt definition
const articleSignificanceClassificationPrompt = ai.definePrompt({
  name: 'articleSignificanceClassificationPrompt',
  input: {
    schema: ArticleSignificanceClassificationInputSchema.extend({
      isTrustedSource: z.boolean().describe('Whether the article source is considered trusted.')
    })
  },
  output: { schema: ArticleSignificanceClassificationOutputSchema },
  prompt: `You are an intelligence analyst for "Iran War Watch", tasked with classifying the significance of news articles related to the Iran conflict.
Your goal is to assign one of the following 'signalLevel' categories to each article and provide a concise 'explanation' (1-2 sentences) for your assessment.

Signal Level Definitions:
-   **Low:** Minor developments, speculative, or indirectly related news. Low immediate impact.
-   **Medium:** Significant regional developments, policy discussions, or confirmed but non-escalatory events. Moderate potential impact.
-   **High:** Direct military movements, significant diplomatic shifts, confirmed escalatory actions, or major impact on global energy markets. High immediate impact or strong potential for escalation.
-   **Critical:** Imminent conflict, direct military engagement, or events with immediate and severe global implications. Very high and immediate impact.

Consider the following factors when making your assessment:
1.  **Keyword Matches:** The presence and relevance of the matched keywords ({{#each matchedKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}).
2.  **Source Credibility:** The article's source is "{{{source}}}". It {{#if isTrustedSource}}IS{{else}}IS NOT{{/if}} considered a trusted news source for "Iran War Watch". Trusted sources may indicate higher credibility.
3.  **Content Urgency and Impact:** The overall tone, immediacy, and potential impact described in the \`title\`, \`description\`, and \`content\`. Look for indicators of escalation, direct conflict, economic impact, or significant policy changes.

---
Article Details:
Title: {{{title}}}
Description: {{{description}}}
Content: {{{content}}}

Your response must be a JSON object matching the following structure:
\`\`\`json
{
  "signalLevel": "low" | "medium" | "high" | "critical",
  "explanation": "A concise explanation for the assigned signal level based on the article's content and keywords."
}
\`\`\`
`
});

// Genkit flow definition
const articleSignificanceClassificationFlow = ai.defineFlow(
  {
    name: 'articleSignificanceClassificationFlow',
    inputSchema: ArticleSignificanceClassificationInputSchema.extend({
      trustedSources: z.array(z.string()).describe('A list of trusted news source names.')
    }),
    outputSchema: ArticleSignificanceClassificationOutputSchema
  },
  async (input) => {
    const isTrustedSource = input.trustedSources.includes(input.source);

    const promptInput = {
      title: input.title,
      description: input.description,
      content: input.content,
      matchedKeywords: input.matchedKeywords,
      source: input.source,
      isTrustedSource: isTrustedSource
    };

    const { output } = await articleSignificanceClassificationPrompt(promptInput);
    return output!;
  }
);

// Exported wrapper function that calls the Genkit flow
export async function classifyArticleSignificance(
  input: ArticleSignificanceClassificationInput,
  trustedSources: string[]
): Promise<ArticleSignificanceClassificationOutput> {
  return articleSignificanceClassificationFlow({ ...input, trustedSources });
}
