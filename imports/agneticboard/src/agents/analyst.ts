import type { RawSignal, Event, Module, ConfidenceBreakdown, OperatorIntent } from '@/lib/types';
import { clusterAndScoreIncidents } from '@/lib/incidents';

/**
 * Triage Agent: Scores the severity and confidence of an event.
 */
export async function triageAgent(event: Event, modules: Module[], allEvents: Event[], intent: OperatorIntent): Promise<{ event: Event, log:string }> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
  
  // --- Initialize ---
  let tags = [...event.tags];
  const description = event.description.toLowerCase();
  const title = event.title.toLowerCase();

  // --- Confidence Calculation ---

  // 1. Source Reliability
  const sourceModule = modules.find(m => m.title.includes(event.source.split(' ')[0]));
  const sourceReliability = sourceModule ? sourceModule.reliability / 100 : 0.75; // Default reliability if not found
  
  // 2. Base Assertion Strength (from event content)
  let assertionStrength = 0.7; // Default base confidence
  if (description.includes('confirmed') || description.includes('verified') || event.source === 'Reality Anchor') {
      assertionStrength = 0.95;
  } else if (description.includes('likely') || description.includes('probable') || description.includes('high confidence')) {
      assertionStrength = 0.8;
  } else if (description.includes('reportedly') || description.includes('unconfirmed') || description.includes('alleged') || description.includes('may have')) {
      assertionStrength = 0.5;
  }

  // Penalize synthetic signals by default
  if (tags.includes('synthetic')) {
      assertionStrength *= 0.9;
  }
  
  // 3. Adjust for Sensationalism
  let sensationalistLog = '';
  const SENSATIONALIST_KEYWORDS = ['shocking', 'explosive', 'bombshell', 'unprecedented', 'reveals', 'slams', 'blasts', 'miracle', 'secret', 'cover-up'];
  if (SENSATIONALIST_KEYWORDS.some(kw => description.includes(kw) || title.includes(kw))) {
      assertionStrength *= 0.85; // Penalize sensationalism
      tags.push('sensationalist');
      sensationalistLog = "Flagged for sensationalist language; assertion strength reduced.";
  }
  
  // 4. Final Weighted Confidence
  const confidence = (sourceReliability * 0.6) + (assertionStrength * 0.4);
  const confidenceBreakdown: ConfidenceBreakdown = {
    sourceReliability: parseFloat(sourceReliability.toFixed(2)),
    assertionStrength: parseFloat(assertionStrength.toFixed(2))
  };

  // --- Tagging & Severity ---
  if (description.includes('ceasefire') || description.includes('peace') || description.includes('not occurred')) {
    tags.push('de-escalation');
  } else if (description.includes('movement') || description.includes('demand') || description.includes('breaks ranks')) {
    tags.push('escalation');
  } else {
    tags.push('neutral');
  }

  // Severity is modulated by confidence and tags
  let severity = confidence * (tags.includes('escalation') ? 1.2 : 0.8);
  
  let intentLog = '';
  // Adjust severity based on operator intent
  if (intent.priority === 'escalation' && tags.includes('escalation')) {
    severity *= 1.25;
    intentLog = 'Severity boosted by Escalation priority.';
  } else if (intent.priority === 'diplomacy' && tags.includes('de-escalation')) {
    severity *= 0.8;
    intentLog = 'Severity reduced by Diplomacy priority.';
  } else if (intent.priority === 'stability') {
    // Penalize instability from either direction
    if (tags.includes('escalation')) severity *= 1.1;
    if (tags.includes('de-escalation')) severity *= 0.9;
    if (!tags.includes('neutral')) intentLog = 'Severity adjusted for Stability priority.';
  }
  
  // --- Novelty Calculation ---
  const recentEvents = allEvents.slice(-20);
  let noveltyScore = 1.0;

  if (recentEvents.length > 0) {
    const actorAsString = JSON.stringify(event.actor);
    const actorOccurrences = recentEvents.filter(e => JSON.stringify(e.actor) === actorAsString).length;
    const domainOccurrences = recentEvents.filter(e => e.domain === event.domain).length;
    const sourceOccurrences = recentEvents.filter(e => e.source === event.source).length;

    // Decrease novelty for each occurrence
    noveltyScore -= (actorOccurrences / recentEvents.length) * 0.3;
    noveltyScore -= (domainOccurrences / recentEvents.length) * 0.2;
    noveltyScore -= (sourceOccurrences / recentEvents.length) * 0.1;

    // If it's a completely new actor in the recent window, boost novelty
    if (allEvents.length > 0 && !allEvents.some(e => JSON.stringify(e.actor) === actorAsString)) {
        noveltyScore += 0.25;
    }
  }
  
  const novelty = parseFloat(Math.max(0.1, Math.min(1, noveltyScore)).toFixed(2));
  
  const triagedEvent: Event = {
    ...event,
    confidence: parseFloat(confidence.toFixed(2)),
    confidenceBreakdown,
    severity: parseFloat(Math.max(0, Math.min(1, severity)).toFixed(2)),
    novelty: novelty,
    tags,
  };

  const logParts = [
    `Triaged event: confidence ${triagedEvent.confidence.toFixed(2)}, severity: ${triagedEvent.severity.toFixed(2)}, novelty: ${triagedEvent.novelty.toFixed(2)}.`,
    intentLog,
    sensationalistLog
  ];
  const log = logParts.filter(Boolean).join(' ');

  return { event: triagedEvent, log };
}

/**
 * Cluster Agent: Updates incident clusters based on the new event.
 */
export async function clusterAgent(event: Event, currentIncidents: Incident[], allEvents: Event[]): Promise<{ incidents: Incident[], log: string }> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const updatedIncidents = clusterAndScoreIncidents(event, currentIncidents, allEvents);
    let log: string;

    if (updatedIncidents.length > currentIncidents.length) {
        log = `Created new incident cluster for event. Now tracking ${updatedIncidents.length}.`;
    } else {
        log = `Merged event into existing incident. Now tracking ${updatedIncidents.length}.`;
    }

    return { incidents: updatedIncidents, log };
}
