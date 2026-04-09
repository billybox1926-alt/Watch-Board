import type { BoardState, Incident, Event } from '@/lib/types';

interface StructuredCritique {
    target: string;
    assumption: string;
    failureMode: string;
    alternative: string;
}

function formatCritique(critique: StructuredCritique): string {
    return `Critique of "${critique.target}"
- Assumption at risk: ${critique.assumption}
- Why it might fail: ${critique.failureMode}
- Better explanation: ${critique.alternative}`;
}


/**
 * Red Team Agent: Challenges the system's top-level conclusions with structured critiques.
 * Acts like a sniper, not noise.
 */
export async function redTeamAgent(
    boardState: BoardState
): Promise<{ critique: string | null, log: string }> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate processing time

    const topIncidents = [...(boardState.incidents || [])]
        .sort((a, b) => b.attentionScore - a.attentionScore)
        .slice(0, 3);
    
    const systemThesis = boardState.compositeState.description;

    const critiques: StructuredCritique[] = [];

    // --- Thesis Critiques ---
    if (systemThesis) {
        // Critique 1: Over-reliance on stability
        if (systemThesis.toLowerCase().includes('stable') && (boardState.globalPulse.escalationPressure?.value ?? 0) > 6) {
            critiques.push({
                target: 'System Thesis (Stability)',
                assumption: 'The system can absorb current levels of escalation pressure without losing stability.',
                failureMode: 'A high-pressure environment can mask underlying fragility. A single, well-placed shock could cause a rapid state change that "stability" metrics did not predict.',
                alternative: 'The system is exhibiting "brittle stability." It appears stable, but is operating closer to its breaking point than the index suggests. Focus should be on resilience to shock, not just current state.'
            });
        }
    }

    // --- Incident Critiques ---
    for (const incident of topIncidents) {
        // Critique 2: Incident correlation is causation
        if (incident.linkedEvents.length > 2 && incident.attentionScore > 0.7) {
             const domains = incident.domains || [];
             if(domains.includes('narrative') && (domains.includes('military') || domains.includes('diplomatic'))) {
                critiques.push({
                    target: `Incident: "${incident.title}"`,
                    assumption: 'The correlated events within this incident represent a coordinated campaign by a single actor or aligned actors.',
                    failureMode: 'The system is pattern-matching unrelated events occurring in a compressed timeframe. Coincidence is being mistaken for coordination.',
                    alternative: 'Two or more separate actors are reacting to the same root stimulus, creating the *illusion* of a coordinated campaign. The real story is the stimulus, not the actors.'
                });
             }
        }
        // Critique 3: Low-confidence events driving high-scoring incidents
        const linkedEvents = (incident.linkedEvents || [])
            .map(id => (boardState.events || []).find(e => e.id === id))
            .filter((e): e is Event => !!e);
            
        if (linkedEvents.length > 0) {
            const avgConfidence = linkedEvents.reduce((acc, e) => acc + (e.confidence || 0), 0) / linkedEvents.length;
            if (incident.attentionScore > 0.6 && avgConfidence < 0.65) {
                 critiques.push({
                    target: `Incident: "${incident.title}"`,
                    assumption: 'The high attention score is warranted despite being built on a foundation of lower-confidence signals.',
                    failureMode: 'The model is amplifying noise. A series of uncertain reports are being aggregated into a high-confidence conclusion, creating a false sense of urgency.',
                    alternative: 'This is not a single, high-threat incident, but rather a "fog of war" cluster. The key signal is the *uncertainty itself*, not the content of the events.'
                });
            }
        }
    }
    
    if (critiques.length === 0) {
        return { critique: null, log: 'No high-value critiques found in this cycle.' };
    }

    // Select the best critique to surface. For now, just pick one at random.
    const selectedCritique = critiques[Math.floor(Math.random() * critiques.length)];
    const formattedCritique = formatCritique(selectedCritique);

    return {
        critique: formattedCritique,
        log: `Generated structured critique for "${selectedCritique.target}".`
    };
}
