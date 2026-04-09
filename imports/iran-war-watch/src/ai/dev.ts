import { config } from 'dotenv';
config();

import '@/ai/flows/generate-why-flagged-explanation.ts';
import '@/ai/flows/article-significance-classification.ts';
import '@/ai/flows/article-scoring-engine.ts';
import '@/ai/flows/generate-situation-briefing.ts';
