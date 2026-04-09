import type { Event, BoardState, SupervisorUpdate, GlobalPulse, Incident, PulseMetric, AgentLogEntry, MemoryRecord, MicroForecast, Contradiction, Tripwire, CausalLink, EmergingSignal, CalibrationRecord, AgentState, MissReport } from '@/lib/types';
import { isDuplicate, simpleUUID } from '@/lib/events';

/**
 * Supervisor Briefing Agent: Writes a human-readable summary of what changed and why it matters.
 */
export async function supervisorBriefAgent(event: Event, newIncidents: Incident[], oldState: BoardState): Promise<{ summary: string, log: string }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    let summary: string;
    const oldIncidents = oldState.incidents;
    const newIncidentCreated = newIncidents.length > oldIncidents.length;

    if (newIncidentCreated) {
        const newIncident = newIncidents[newIncidents.length - 1];
        summary = `A new incident has been created ("${newIncident.title}") based on the event "${event.title}", suggesting a new vector of activity is opening up.`;
    } else {
        const updatedIncident = newIncidents.find(newInc => {
            const oldInc = oldIncidents.find(oi => oi.id === newInc.id);
            return oldInc && newInc.lastUpdated !== oldInc.lastUpdated && newInc.linkedEvents.includes(event.id);
        });

        if (updatedIncident) {
            const oldVersion = oldIncidents.find(oi => oi.id === updatedIncident.id)!;
            const scoreChange = updatedIncident.attentionScore - oldVersion.attentionScore;
            let summary_part;
            if (scoreChange > 0.05) {
                summary_part = `escalated significantly. This suggests the situation is intensifying.`;
            } else if (scoreChange < -0.05) {
                summary_part = `de-escalated. This may indicate a reduction in tension or a shift in focus.`;
            } else {
                summary_part = `was updated. This reflects ongoing activity without a major change in threat level.`;
            }
            summary = `Incident "${updatedIncident.title}" ${summary_part}`;
        } else {
             summary = `Event "${event.title}" was processed without causing a significant change to existing incidents. The board state remains relatively stable.`
        }
    }
    return { summary, log: "Generated supervisor briefing." };
}

/**
 * Forecast Agent: Generates competing hypotheses about the state of the board.
 */
export async function forecastAgent(currentState: BoardState, newEvent: Event, newIncidents: Incident[]): Promise<{ forecast: BoardState['forecast'], log: string }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const { operatorIntent, globalPulse, incidents: oldIncidents, calibration } = currentState;

    const microForecasts: MicroForecast[] = [];
    const drivers: string[] = [];

    const calibrationAdjustment = (calibration.underconfidenceScore - calibration.overconfidenceScore) / 5;

    // --- 1. Incident Escalation Forecast ---
    const topOldIncident = [...oldIncidents].sort((a,b) => b.attentionScore - a.attentionScore)[0];
    const topNewIncident = newIncidents.find(i => i.id === topOldIncident?.id);
    
    if (topOldIncident && topNewIncident && topNewIncident.attentionScore > topOldIncident.attentionScore) {
        const scoreIncrease = topNewIncident.attentionScore - topOldIncident.attentionScore;
        let probability = 30 + (scoreIncrease * 100) + (globalPulse.escalationPressure.value * 2);
        if (operatorIntent.priority === 'escalation') probability += 10;
        probability += calibrationAdjustment;
        
        microForecasts.push({
            id: 'mf-inc-escalation',
            title: `Incident "${topNewIncident.title}" will escalate further`,
            probability: Math.min(95, Math.max(5, Math.round(probability))),
            description: "The primary incident's attention score is increasing, suggesting momentum.",
            timeHorizon: "1-3 cycles",
            drivers: [
                `Score increased by ${scoreIncrease.toFixed(2)} this cycle`,
                `Escalation Pressure is ${globalPulse.escalationPressure.value.toFixed(1)}/10`,
            ]
        });
        drivers.push('Incident Escalation');
    }

    // --- 2. Tripwire Approaching Forecast ---
    const approachingTripwire = currentState.tripwires.items.find(t => t.id === 'tw4'); // Autonomous trigger
    if (approachingTripwire && approachingTripwire.status === 'inactive') {
        const pressure = globalPulse.escalationPressure.value;
        if (pressure > 7 && globalPulse.escalationPressure.trend === 'up') {
            let probability = pressure * 10;
            probability += calibrationAdjustment;

             microForecasts.push({
                id: 'mf-tw-approaching',
                title: `Tripwire "Autonomous trigger" will move to 'approaching'`,
                probability: Math.min(90, Math.max(5, Math.round(probability))),
                description: "Sustained high escalation pressure is pushing the system towards a non-linear snap point.",
                timeHorizon: "2-5 cycles",
                drivers: [
                    `Escalation Pressure is high (${pressure.toFixed(1)}) and rising`,
                ]
            });
            drivers.push('Tripwire Approaching');
        }
    }
    
    // --- 3. New Contradiction Forecast ---
    const drift = globalPulse.narrativeDrift.value;
    if (drift > 6 && globalPulse.narrativeDrift.trend === 'up') {
        let probability = 20 + (drift * 5);
        if (currentState.contradictions.items.length > 0) probability += 15;
        probability += calibrationAdjustment;

        microForecasts.push({
            id: 'mf-contradiction',
            title: `A new narrative contradiction will be detected`,
            probability: Math.min(85, Math.max(5, Math.round(probability))),
            description: "High narrative drift between actors increases the likelihood of actions and statements falling out of sync.",
            timeHorizon: "1-4 cycles",
            drivers: [
                `Narrative Drift is high (${drift.toFixed(1)}) and rising`,
                `${currentState.contradictions.items.length} active contradiction(s)`,
            ]
        });
        drivers.push('New Contradiction');
    }

    // --- Keep random risk updates from original for now ---
    const newRisks = currentState.forecast.risks.map(risk => ({
        ...risk,
        value: Math.max(0, Math.min(100, risk.value + Math.round((Math.random() - 0.5) * 4)))
    }));

    const logMessage = `Generated ${microForecasts.length} micro-forecasts. Drivers: ${drivers.join(', ') || 'none'}.`;

    return {
        forecast: {
            risks: newRisks,
            microForecasts,
        },
        log: logMessage
    };
}


const CONTRADICTION_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

function detectContradictions(event: Event, currentState: BoardState): Contradiction | null {
    const recentEvents = currentState.events;
    let contradiction: Contradiction | null = null;

    const areActorsEqual = (a1: string | string[], a2: string | string[]): boolean => {
        const arr1 = Array.isArray(a1) ? a1 : [a1];
        const arr2 = Array.isArray(a2) ? a2 : [a2];
        return arr1.some(a => arr2.includes(a));
    };

    const check = (narrativeEvent: Event, kineticEvent: Event) => {
        const timeDiff = Math.abs(new Date(narrativeEvent.timestamp).getTime() - new Date(kineticEvent.timestamp).getTime());
        if (areActorsEqual(narrativeEvent.actor, kineticEvent.actor) && timeDiff < CONTRADICTION_WINDOW_MS) {
            return {
                id: simpleUUID(),
                actor: Array.isArray(narrativeEvent.actor) ? narrativeEvent.actor.join(', ') : narrativeEvent.actor,
                statement: `Said: "${narrativeEvent.title}"`,
                action: `Did: "${kineticEvent.title}"`,
                severity: 'Medium' as 'Medium',
                timestamp: new Date().toISOString()
            };
        }
        return null;
    }

    if ((event.domain === 'diplomatic' || event.domain === 'narrative') && event.tags.includes('de-escalation')) {
        for (const oldEvent of recentEvents) {
            if (oldEvent.domain === 'military' && oldEvent.tags.includes('escalation')) {
                contradiction = check(event, oldEvent);
                if (contradiction) break;
            }
        }
    }
    else if (event.domain === 'military' && event.tags.includes('escalation')) {
        for (const oldEvent of recentEvents) {
            if ((oldEvent.domain === 'diplomatic' || oldEvent.domain === 'narrative') && oldEvent.tags.includes('de-escalation')) {
                contradiction = check(oldEvent, event);
                if (contradiction) break;
            }
        }
    }

    return contradiction;
}


function calculateGlobalPulse(event: Event, currentState: BoardState, updatedIncidents: Incident[], updatedContradictions: Contradiction[]): GlobalPulse {
    const recentEvents = [...currentState.events, event].slice(-50); // Analyze last 50 events
    const oldPulse = currentState.globalPulse;
    const now = new Date();

    const getWeight = (timestamp: string, halfLifeHours = 24) => {
        const ageMs = now.getTime() - new Date(timestamp).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        // Exponential decay with a configurable half-life
        return Math.exp(-0.693 * ageHours / halfLifeHours);
    };

    const kineticTempoScore = recentEvents
        .filter(e => e.domain === 'military' && e.severity > 0.7)
        .reduce((acc, e) => acc + getWeight(e.timestamp), 0);
    const newKineticTempo = Math.min(kineticTempoScore, 10);

    const skepticFlagsScore = recentEvents
        .filter(e => e.tags.includes('critic-flagged'))
        .reduce((acc, e) => acc + getWeight(e.timestamp), 0);
    const contradictionScore = updatedContradictions.length * 2; // Contradictions are recent by definition
    const newNarrativeDrift = Math.min(contradictionScore + skepticFlagsScore, 10);

    const incidentPressure = updatedIncidents.reduce((acc, inc) => {
        // Weight incident score by its recency. Incidents have a longer half-life.
        return acc + (inc.attentionScore * getWeight(inc.lastUpdated, 48));
    }, 0);
    // Note: this is a sum, not an average, to represent total pressure.
    
    const pressureFromEvents = recentEvents
        .filter(e => e.tags.includes('escalation'))
        .reduce((acc, e) => acc + getWeight(e.timestamp), 0);
    const newEscalationPressure = Math.min(incidentPressure + pressureFromEvents, 10);
    
    const newCooperationLevel = Math.min(currentState.memory.residue.cooperation / 10, 10); // This is based on residue which already decays

    let totalConfidence = 0;
    let totalConfidenceWeight = 0;
    recentEvents.forEach(e => {
        const weight = getWeight(e.timestamp);
        totalConfidence += e.confidence * weight;
        totalConfidenceWeight += weight;
    });
    const avgConfidence = totalConfidenceWeight > 0 ? totalConfidence / totalConfidenceWeight : 1;
    const newUncertainty = Math.min(((1 - avgConfidence) * 10) + skepticFlagsScore, 10);

    const getTrend = (oldValue: number, newValue: number): ('up' | 'down' | 'stable') => {
        const diff = newValue - oldValue;
        if (diff > 0.1) return 'up';
        if (diff < -0.1) return 'down';
        return 'stable';
    }

    return {
        kineticTempo: { value: parseFloat(newKineticTempo.toFixed(1)), trend: getTrend(oldPulse.kineticTempo.value, newKineticTempo), description: oldPulse.kineticTempo.description },
        narrativeDrift: { value: parseFloat(newNarrativeDrift.toFixed(1)), trend: getTrend(oldPulse.narrativeDrift.value, newNarrativeDrift), description: oldPulse.narrativeDrift.description },
        escalationPressure: { value: parseFloat(newEscalationPressure.toFixed(1)), trend: getTrend(oldPulse.escalationPressure.value, newEscalationPressure), description: oldPulse.escalationPressure.description },
        cooperationLevel: { value: parseFloat(newCooperationLevel.toFixed(1)), trend: getTrend(oldPulse.cooperationLevel.value, newCooperationLevel), description: oldPulse.cooperationLevel.description },
        uncertainty: { value: parseFloat(newUncertainty.toFixed(1)), trend: getTrend(oldPulse.uncertainty.value, newUncertainty), description: oldPulse.uncertainty.description }
    };
}


function evaluateTripwires(event: Event, updatedIncidents: Incident[], currentState: BoardState, newGlobalPulse: GlobalPulse): { updatedTripwires: Tripwire[], logs: AgentLogEntry[] } {
    const logs: AgentLogEntry[] = [];
    const updatedTripwires = currentState.tripwires.items.map(tripwire => {
        let newStatus = tripwire.status;
        
        // Define conditions for each tripwire
        switch (tripwire.id) {
            case 'tw1': // Civilian desalination infrastructure hit
                if (event.domain === 'infrastructure' && event.description.toLowerCase().includes('desalination')) {
                    if (event.severity > 0.9) {
                        newStatus = 'triggered';
                    } else if (event.severity > 0.7 && newStatus !== 'triggered') {
                        newStatus = 'approaching';
                    }
                }
                break;
            case 'tw2': // Commercial shipping campaign resumes
                if (event.source === 'Kinetic Feed' && event.description.toLowerCase().includes('shipping') && event.tags.includes('escalation')) {
                    if (event.severity > 0.8) {
                        newStatus = 'triggered';
                    } else if (newStatus !== 'triggered') {
                        newStatus = 'approaching';
                    }
                }
                break;
            case 'tw3': // Framework fracture
                if (newGlobalPulse.cooperationLevel.value < 2 && newGlobalPulse.cooperationLevel.trend === 'down') {
                    if (currentState.incidents.some(inc => inc.attentionScore > 0.8)) {
                         newStatus = 'triggered';
                    } else if (newStatus !== 'triggered') {
                        newStatus = 'approaching';
                    }
                }
                break;
            case 'tw4': // Autonomous trigger
                if (newGlobalPulse.escalationPressure.value > 9 && newGlobalPulse.uncertainty.value < 3) {
                     newStatus = 'triggered';
                } else if (newGlobalPulse.escalationPressure.value > 8 && newStatus !== 'triggered') {
                    newStatus = 'approaching';
                }
                break;
        }

        if (newStatus !== tripwire.status) {
            logs.push({
                agent: "Supervisor",
                message: `Tripwire '${tripwire.title}' status changed to ${newStatus.toUpperCase()}.`,
                timestamp: new Date().toISOString()
            });
        }

        return { ...tripwire, status: newStatus };
    });

    return { updatedTripwires, logs };
}

function inferCausalLinks(newEvent: Event, currentState: BoardState): CausalLink[] {
    const newLinks: CausalLink[] = [];
    const CAUSAL_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

    const areActorsRelated = (a1: string | string[], a2: string | string[]): boolean => {
        const arr1 = Array.isArray(a1) ? a1 : [a1];
        const arr2 = Array.isArray(a2) ? a2 : [a2];
        return arr1.some(a => arr2.includes(a));
    };

    // only look at recent events to avoid performance issues
    const recentEvents = currentState.events.slice(-20);

    for (const oldEvent of recentEvents) {
        if (oldEvent.id === newEvent.id) continue;

        const timeDiff = new Date(newEvent.timestamp).getTime() - new Date(oldEvent.timestamp).getTime();

        if (timeDiff > 0 && timeDiff < CAUSAL_WINDOW_MS) {
            if (areActorsRelated(newEvent.actor, oldEvent.actor)) {
                let type: CausalLink['type'] = 'influence';
                if (newEvent.severity > oldEvent.severity + 0.2 && newEvent.tags.includes('escalation')) {
                    type = 'escalation';
                } else if (oldEvent.tags.includes('escalation') && newEvent.tags.includes('de-escalation')) {
                    type = 'suppression';
                } else if (oldEvent.domain === 'diplomatic' && newEvent.domain === 'military') {
                    type = 'trigger';
                }
                
                const strength = parseFloat((1 - (timeDiff / CAUSAL_WINDOW_MS)).toFixed(2)); // closer is stronger

                newLinks.push({
                    from: oldEvent.id,
                    to: newEvent.id,
                    strength: strength,
                    type: type,
                });
            }
        }
    }
    return newLinks;
}

function updateCalibration(
    currentState: BoardState,
    updatedIncidents: Incident[],
    newContradiction: Contradiction | null,
    updatedTripwires: Tripwire[]
): { overconfidenceDelta: number; underconfidenceDelta: number; newHistoryRecords: CalibrationRecord[] } {
    const oldMicroForecasts = currentState.forecast.microForecasts || [];
    const now = new Date().toISOString();

    let overconfidenceDelta = -0.5; // Natural decay
    let underconfidenceDelta = -0.5; // Natural decay
    const newHistoryRecords: CalibrationRecord[] = [];

    if (oldMicroForecasts.length === 0) {
        return { overconfidenceDelta, underconfidenceDelta, newHistoryRecords };
    }

    // --- Evaluate Micro-Forecasts from the previous cycle against the new state ---

    const escalationForecast = oldMicroForecasts.find(f => f.id === 'mf-inc-escalation');
    if (escalationForecast) {
        const oldTopIncident = [...currentState.incidents].sort((a, b) => b.attentionScore - a.attentionScore)[0];
        if (oldTopIncident) {
            const newVersionOfOldTopIncident = updatedIncidents.find(i => i.id === oldTopIncident.id);
            if (newVersionOfOldTopIncident) {
                const escalated = newVersionOfOldTopIncident.attentionScore > oldTopIncident.attentionScore + 0.02;
                const deescalated = newVersionOfOldTopIncident.attentionScore < oldTopIncident.attentionScore - 0.02;

                if (escalated) {
                    if (escalationForecast.probability < 40) {
                        underconfidenceDelta += 5;
                        newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: escalationForecast.title, predictedProbability: escalationForecast.probability, outcome: 'confirmed', notes: `System under-predicted escalation. Incident score increased.`, timestamp: now });
                    }
                } else if (deescalated) {
                    if (escalationForecast.probability > 60) {
                        overconfidenceDelta += 5;
                        newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: escalationForecast.title, predictedProbability: escalationForecast.probability, outcome: 'denied', notes: `System over-predicted escalation. Incident score decreased.`, timestamp: now });
                    }
                }
            }
        }
    }

    const contradictionForecast = oldMicroForecasts.find(f => f.id === 'mf-contradiction');
    if (contradictionForecast) {
        if (newContradiction) {
            if (contradictionForecast.probability < 40) {
                underconfidenceDelta += 5;
                newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: contradictionForecast.title, predictedProbability: contradictionForecast.probability, outcome: 'confirmed', notes: `System under-predicted new contradiction. One was detected.`, timestamp: now });
            }
        } else {
            if (contradictionForecast.probability > 60) {
                overconfidenceDelta += 5;
                newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: contradictionForecast.title, predictedProbability: contradictionForecast.probability, outcome: 'denied', notes: `System over-predicted new contradiction. None was detected.`, timestamp: now });
            }
        }
    }

    const tripwireForecast = oldMicroForecasts.find(f => f.id === 'mf-tw-approaching');
    if (tripwireForecast) {
        const tripwireTitleMatch = tripwireForecast.title.match(/Tripwire "(.*?)"/);
        if (tripwireTitleMatch?.[1]) {
            const tripwireTitle = tripwireTitleMatch[1];
            const oldTripwire = currentState.tripwires.items.find(t => t.title === tripwireTitle);
            const newTripwire = updatedTripwires.find(t => t.title === tripwireTitle);

            if (oldTripwire && newTripwire) {
                const wasApproaching = newTripwire.status === 'approaching' && oldTripwire.status === 'inactive';
                if (wasApproaching) {
                    if (tripwireForecast.probability < 40) {
                        underconfidenceDelta += 5;
                        newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: tripwireForecast.title, predictedProbability: tripwireForecast.probability, outcome: 'confirmed', notes: `System under-predicted tripwire status change.`, timestamp: now });
                    }
                } else if (newTripwire.status === 'inactive') {
                    if (tripwireForecast.probability > 60) {
                        overconfidenceDelta += 5;
                        newHistoryRecords.push({ id: simpleUUID(), hypothesisTitle: tripwireForecast.title, predictedProbability: tripwireForecast.probability, outcome: 'denied', notes: `System over-predicted tripwire status change.`, timestamp: now });
                    }
                }
            }
        }
    }

    return { overconfidenceDelta, underconfidenceDelta, newHistoryRecords };
}


function calculateStabilityIndex(
    globalPulse: GlobalPulse,
    contradictions: Contradiction[],
    tripwires: Tripwire[],
    oldStability: number
): { score: number, trend: 'up' | 'down' | 'stable' } {
    let stabilityScore = 1.0; // Start with perfect stability

    // 1. Factor in Global Pulse metrics (destabilizing factors)
    // Values are 0-10, so multipliers should be small.
    stabilityScore -= globalPulse.kineticTempo.value * 0.015;       // Max -0.15
    stabilityScore -= globalPulse.narrativeDrift.value * 0.025;      // Max -0.25
    stabilityScore -= globalPulse.escalationPressure.value * 0.025;  // Max -0.25
    stabilityScore -= globalPulse.uncertainty.value * 0.01;         // Max -0.1

    // Factor in stabilizing metrics
    stabilityScore += globalPulse.cooperationLevel.value * 0.02;     // Max +0.2

    // 2. Factor in Contradictions
    stabilityScore -= contradictions.length * 0.05; // Each active contradiction costs 0.05

    // 3. Factor in Tripwires
    tripwires.forEach(tw => {
        if (tw.status === 'approaching') {
            stabilityScore -= 0.10;
        } else if (tw.status === 'triggered') {
            stabilityScore -= 0.25;
        }
    });

    // Clamp score between 0 and 1
    const finalScore = Math.max(0, Math.min(1, stabilityScore));

    const getTrend = (oldValue: number, newValue: number): ('up' | 'down' | 'stable') => {
        const diff = newValue - oldValue;
        if (diff > 0.02) return 'up';
        if (diff < -0.02) return 'down';
        return 'stable';
    }

    return {
        score: finalScore,
        trend: getTrend(oldStability, finalScore),
    };
}


function updateAgentScores(
    currentState: BoardState,
    event: Event,
    redTeamNote: string | null,
    updatedIncidents: Incident[],
    calibrationDeltas: { overconfidenceDelta: number, underconfidenceDelta: number }
): { updatedAgentStates: AgentState[], log: string } {
    const log: string = 'Updated agent performance scores based on multi-dimensional metrics.';
    const agentWeights = {
        triage: { precision: 0.6, usefulness: 0.2, calibration: 0.2 },
        redTeam: { precision: 0.2, usefulness: 0.6, calibration: 0.2 },
        forecast: { precision: 0.2, usefulness: 0.2, calibration: 0.6 },
        cluster: { precision: 0.4, usefulness: 0.4, calibration: 0.2 },
        supervisorBrief: { precision: 0.34, usefulness: 0.33, calibration: 0.33 },
    };

    const updatedAgentStates = currentState.agentStates.map(agent => {
        // Copy scores to avoid direct mutation
        let scores = { ...(agent.scores || { precision: 75, usefulness: 75, calibration: 75 }) };

        // 1. Apply decay to all scores
        scores.precision = Math.max(0, scores.precision - 0.5);
        scores.usefulness = Math.max(0, scores.usefulness - 0.5);
        scores.calibration = Math.max(0, scores.calibration - 0.5);

        // 2. Apply agent-specific adjustments
        switch (agent.id) {
            case 'triage': {
                // Precision: Use final confidence as a proxy for correctness. Higher confidence event implies good triage.
                scores.precision = scores.precision * 0.9 + (event.confidence * 100) * 0.1;
                // Usefulness: Always useful as a required pipeline step.
                scores.usefulness += 0.5;
                // Calibration: Penalize if the event was part of a mis-calibration.
                if (calibrationDeltas.overconfidenceDelta > 0 || calibrationDeltas.underconfidenceDelta > 0) {
                    scores.calibration = Math.max(0, scores.calibration - 5);
                }
                break;
            }
            case 'redTeam': {
                if (redTeamNote) {
                    // Usefulness: Highly useful for finding something.
                    scores.usefulness = Math.min(100, scores.usefulness + 10);
                    // Precision: If it found something, it was precise. Assume the challenge was valid.
                    scores.precision = Math.min(100, scores.precision + 5);
                }
                break;
            }
            case 'forecast': {
                // Calibration: This is its main job. Penalize for bad forecasts, reward for good ones.
                if (calibrationDeltas.overconfidenceDelta > 0 || calibrationDeltas.underconfidenceDelta > 0) {
                    scores.calibration = Math.max(0, scores.calibration - 10);
                } else {
                    scores.calibration = Math.min(100, scores.calibration + 2); // Reward for no error
                }
                break;
            }
            case 'cluster': {
                const newIncidentCreated = updatedIncidents.length > currentState.incidents.length;
                if (newIncidentCreated) {
                    // Usefulness: Creating a new incident is useful.
                    scores.usefulness = Math.min(100, scores.usefulness + 5);
                }
                break;
            }
            case 'supervisorBrief': {
                // No easy way to score. Just decay.
                break;
            }
        }
        
        // Clamp scores
        scores.precision = Math.max(0, Math.min(100, scores.precision));
        scores.usefulness = Math.max(0, Math.min(100, scores.usefulness));
        scores.calibration = Math.max(0, Math.min(100, scores.calibration));

        // 3. Calculate weighted reliability score
        const weights = agentWeights[agent.id as keyof typeof agentWeights] || { precision: 0.34, usefulness: 0.33, calibration: 0.33 };
        const reliability = 
            scores.precision * weights.precision +
            scores.usefulness * weights.usefulness +
            scores.calibration * weights.calibration;

        return { 
            ...agent, 
            scores,
            reliability: Math.max(20, Math.min(100, reliability)) // Clamp final reliability
        };
    });

    return { updatedAgentStates, log };
}

function generateMissReports(
    brief: string,
    redTeamNote: string | null,
    newContradiction: Contradiction | null,
    updatedTripwires: Tripwire[],
    oldTripwires: Tripwire[],
    calibrationHistoryForCycle: CalibrationRecord[]
): MissReport[] {
    const reports: MissReport[] = [];
    const now = new Date().toISOString();

    // 1. Forecast Miss (from calibration records)
    if (calibrationHistoryForCycle.length > 0) {
        const miss = calibrationHistoryForCycle[0]; // Process the first miss in the cycle for the report
         reports.push({
            id: simpleUUID(),
            agentName: 'Forecast',
            whatWasWrong: `The forecast for "${miss.hypothesisTitle}" was ${miss.predictedProbability < 50 ? 'under-confident' : 'over-confident'} on a ${miss.outcome} outcome.`,
            whyItHappened: `The system predicted with ${miss.predictedProbability}% probability, but the outcome was ${miss.outcome}. ${miss.notes}`,
            adjustmentMade: `The system's overall ${miss.predictedProbability < 50 && miss.outcome === 'confirmed' ? 'underconfidence' : 'overconfidence'} score was increased. Future forecasts will be adjusted.`,
            timestamp: now,
        });
    }

    // 2. Red Team Miss
    if (newContradiction && !redTeamNote) {
         reports.push({
            id: simpleUUID(),
            agentName: 'Red Team',
            whatWasWrong: 'Failed to flag an emerging narrative-reality contradiction.',
            whyItHappened: 'The agent was focused on incident-level threats and missed a cross-event pattern discrepancy that the Supervisor later detected.',
            adjustmentMade: 'Red Team agent `usefulness` score has been penalized to encourage broader pattern analysis in subsequent cycles.',
            timestamp: now,
        });
    }

    // 3. Briefing Miss
    const tripwireTriggered = updatedTripwires.some(t => t.status === 'triggered' && oldTripwires.find(ot => ot.id === t.id)?.status !== 'triggered');
    const briefingUnderstatedRisk = brief.toLowerCase().includes('stable') && tripwireTriggered;

    if (briefingUnderstatedRisk) {
         reports.push({
            id: simpleUUID(),
            agentName: 'Briefing',
            whatWasWrong: 'The top-line summary significantly understated system risk.',
            whyItHappened: `The brief described the state as "stable" while a critical tripwire was simultaneously triggered.`,
            adjustmentMade: 'Briefing agent `precision` score has been penalized.',
            timestamp: now,
        });
    }

    return reports;
}

/**
 * Supervisor: Takes all agent outputs and updates the final board state.
 */
export async function supervisor(
    event: Event, 
    currentState: BoardState,
    updatedIncidents: Incident[],
    supervisorBrief: string,
    redTeamNote: string | null,
    updatedForecast: BoardState['forecast'],
): Promise<SupervisorUpdate> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const logs: AgentLogEntry[] = [];

  // 1. Duplicate Suppression (Checked early in the loop now)
  if (isDuplicate(event, currentState.events)) {
    logs.push({ agent: "Supervisor", message: `Suppressed duplicate event: "${event.title}"`, timestamp: new Date().toISOString() });
    return { logs, newState: {} };
  }
  logs.push({ agent: "Supervisor", message: `Processing new event: "${event.title}"`, timestamp: new Date().toISOString() });
  
  // 2. Update Module Reliability
  const moduleToUpdate = currentState.modules.find(m => m.title.includes(event.source.split(' ')[0]));
  let newModules = [...currentState.modules];
  if(moduleToUpdate) {
    const oldReliability = moduleToUpdate.reliability;
    // Reinforce reliability based on the confidence of the event it produced.
    const eventConfidenceScore = event.confidence * 100;
    const newReliability = Math.max(0, Math.min(100, Math.round(oldReliability * 0.95 + eventConfidenceScore * 0.05)));
    newModules = currentState.modules.map(m => 
        m.id === moduleToUpdate.id ? { ...m, reliability: newReliability } : m
    );
    logs.push({ agent: "Supervisor", message: `${moduleToUpdate.title} reliability updated from ${oldReliability} to ${newReliability}.`, timestamp: new Date().toISOString() });
  }

  // 3. Update Memory Residue
  let { cooperation, betrayal, shock } = currentState.memory.residue;
  cooperation = Math.max(0, cooperation - 1);
  betrayal = Math.max(0, betrayal - 1);
  shock = Math.max(0, shock - 1);

  if (event.tags.includes('de-escalation')) {
      cooperation = Math.min(100, cooperation + 5);
      logs.push({ agent: "Supervisor", message: 'Increased cooperation residue.', timestamp: new Date().toISOString() });
  } else if (event.tags.includes('escalation')) {
      betrayal = Math.min(100, betrayal + 5);
      logs.push({ agent: "Supervisor", message: 'Increased betrayal residue.', timestamp: new Date().toISOString() });
  }

  // 4. Detect Contradictions
  const newContradiction = detectContradictions(event, currentState);
  let updatedContradictions = [...currentState.contradictions.items];
  if (newContradiction) {
      if (!updatedContradictions.some(c => c.statement === newContradiction.statement && c.action === newContradiction.action)) {
          updatedContradictions = [newContradiction, ...updatedContradictions].slice(0, 3); // Keep last 3
          logs.push({ agent: "Supervisor", message: `Detected narrative contradiction for ${newContradiction.actor}.`, timestamp: new Date().toISOString() });
      }
  }

  // 5. Calculate new pulse
  const newGlobalPulse = calculateGlobalPulse(event, currentState, updatedIncidents, updatedContradictions);
  logs.push({ agent: "Supervisor", message: 'Global Pulse updated.', timestamp: new Date().toISOString() });
  
  // 6. Evaluate Tripwires
  const { updatedTripwires, logs: tripwireLogs } = evaluateTripwires(event, updatedIncidents, currentState, newGlobalPulse);
  logs.push(...tripwireLogs);
  
  // 7. Calculate Stability Index
  const { score: newStabilityIndex, trend: newStabilityTrend } = calculateStabilityIndex(newGlobalPulse, updatedContradictions, updatedTripwires, currentState.compositeState.stabilityIndex);
  logs.push({ agent: "Supervisor", message: `Recalculated stability index to ${newStabilityIndex.toFixed(2)}. Trend: ${newStabilityTrend}`, timestamp: new Date().toISOString() });
  
  let stabilityDescription: string;
    if (newStabilityIndex > 0.8) {
        stabilityDescription = "System is highly stable and resilient to shocks.";
    } else if (newStabilityIndex > 0.6) {
        stabilityDescription = "System is stable, but key metrics require monitoring.";
    } else if (newStabilityIndex > 0.4) {
        stabilityDescription = "System is showing signs of fragility. Multiple pressures are building.";
    } else if (newStabilityIndex > 0.2) {
        stabilityDescription = "System is unstable. High risk of unpredictable behavior. Tripwires are close.";
    } else {
        stabilityDescription = "Critical instability. The board is close to a chaotic state change.";
    }
    logs.push({ agent: "Supervisor", message: `New stability description: "${stabilityDescription}"`, timestamp: new Date().toISOString() });

  // 8. Infer Causal Links
  const newCausalLinks = inferCausalLinks(event, currentState);
  const updatedCausalLinks = [...currentState.causalLinks, ...newCausalLinks].slice(-50); // Keep last 50 links
  if (newCausalLinks.length > 0) {
      logs.push({ agent: "Supervisor", message: `Inferred ${newCausalLinks.length} new causal link(s).`, timestamp: new Date().toISOString() });
  }

  // 10. Detect Weak Signals
    const WEAK_SIGNAL_NOVELTY_THRESHOLD = 0.7;
    const WEAK_SIGNAL_SEVERITY_THRESHOLD = 0.4;
    let updatedEmergingSignals = [...currentState.emergingSignals.items];

    if (event.novelty > WEAK_SIGNAL_NOVELTY_THRESHOLD && event.severity < WEAK_SIGNAL_SEVERITY_THRESHOLD) {
        const newSignal: EmergingSignal = {
            id: simpleUUID(),
            eventId: event.id,
            title: event.title,
            summary: `A novel event from ${event.source} involving actor ${Array.isArray(event.actor) ? event.actor.join(', ') : event.actor}.`,
            score: event.novelty,
            timestamp: event.timestamp,
        };
        // Prevent duplicates
        if (!updatedEmergingSignals.some(s => s.eventId === newSignal.eventId)) {
            updatedEmergingSignals = [newSignal, ...updatedEmergingSignals].slice(0, 5); // Keep last 5
            logs.push({ agent: "Supervisor", message: `Detected a new weak signal: "${event.title}"`, timestamp: new Date().toISOString() });
        }
    }
    
  // 11. Update Calibration
    const { overconfidenceDelta, underconfidenceDelta, newHistoryRecords } = updateCalibration(currentState, updatedIncidents, newContradiction, updatedTripwires);
    const newOverconfidence = parseFloat(Math.max(0, Math.min(100, currentState.calibration.overconfidenceScore + overconfidenceDelta)).toFixed(1));
    const newUnderconfidence = parseFloat(Math.max(0, Math.min(100, currentState.calibration.underconfidenceScore + underconfidenceDelta)).toFixed(1));
    let newCalibrationHistory = currentState.calibration.history;
    if (newHistoryRecords.length > 0) {
        newCalibrationHistory = [...newHistoryRecords, ...currentState.calibration.history].slice(0, 10); // keep last 10
        newHistoryRecords.forEach(rec => {
            logs.push({ agent: "Supervisor", message: `Generated new calibration record for hypothesis "${rec.hypothesisTitle}".`, timestamp: new Date().toISOString() });
        });
    }

    // 9. Update Agent Performance
    const { updatedAgentStates, log: agentScoreLog } = updateAgentScores(
        currentState,
        event,
        redTeamNote,
        updatedIncidents,
        { overconfidenceDelta, underconfidenceDelta }
    );
    if (agentScoreLog) {
        logs.push({ agent: "Supervisor", message: agentScoreLog, timestamp: new Date().toISOString() });
    }

  // 12. Generate System Thesis
  const topForecast = [...updatedForecast.microForecasts].sort((a, b) => b.probability - a.probability)[0];
  const biggestRisk = [...updatedForecast.risks].sort((a, b) => b.value - a.value)[0];
  
  let systemThesis = '';
  
  if (newStabilityIndex > 0.8) {
      systemThesis = `The system remains highly stable. The most likely outcome is: "${topForecast?.title || 'continued stability'}" (${topForecast?.probability || 'N/A'}%).`;
  } else if (newStabilityIndex < 0.3) {
      systemThesis = `CRITICAL INSTABILITY: With a stability index of ${newStabilityIndex.toFixed(2)}, the board is fragile. The primary risk is "${biggestRisk.title}" (${biggestRisk.value}%).`;
  } else {
      const topIncident = [...updatedIncidents].sort((a, b) => b.attentionScore - a.attentionScore)[0];
      systemThesis = `The system is contested but managing pressure. `;
      if (topIncident && topIncident.attentionScore > 0.6) {
          systemThesis += `Focus is on the incident "${topIncident.title}". `
      }
      systemThesis += `The most likely outcome remains: "${topForecast?.title || 'uncertain'}" (${topForecast?.probability || 'N/A'}%).`;
  }
  logs.push({ agent: "Supervisor", message: `Generated new system thesis.`, timestamp: new Date().toISOString() });

    // 13. Generate Miss Reports
    const newMissReports = generateMissReports(
        supervisorBrief,
        redTeamNote,
        newContradiction,
        updatedTripwires,
        currentState.tripwires.items,
        newHistoryRecords
    );
    if (newMissReports.length > 0) {
        logs.push({ agent: "Supervisor", message: `Generated ${newMissReports.length} new agent miss report(s).`, timestamp: new Date().toISOString() });
    }

  // 14. Create Memory Record
  const newMemoryRecord: MemoryRecord = {
    timestamp: new Date().toISOString(),
    summary: supervisorBrief,
    pulse: newGlobalPulse,
    stabilityIndex: newStabilityIndex,
    forecast: updatedForecast,
  };
  logs.push({ agent: "Supervisor", message: 'Created new memory record.', timestamp: new Date().toISOString() });


  const update: SupervisorUpdate = {
    logs,
    newState: {
        supervisorBrief: supervisorBrief,
        redTeamNote: redTeamNote,
        incidents: updatedIncidents,
        modules: newModules,
        agentStates: updatedAgentStates,
        events: [...currentState.events, event].slice(-50), // keep last 50 events
        memory: {
            ...currentState.memory,
            residue: { cooperation, betrayal, shock },
            history: [newMemoryRecord, ...currentState.memory.history].slice(-20)
        },
        compositeState: {
            ...currentState.compositeState,
            stabilityIndex: newStabilityIndex,
            stabilityTrend: newStabilityTrend,
            scoreDescription: stabilityDescription,
            description: systemThesis,
        },
        terminal: {
            ...currentState.terminal,
             memoryBurden: { cooperation, betrayal, shock },
        },
        globalPulse: newGlobalPulse,
        forecast: updatedForecast,
        contradictions: {
            ...currentState.contradictions,
            items: updatedContradictions,
        },
        tripwires: {
            ...currentState.tripwires,
            items: updatedTripwires,
        },
        emergingSignals: {
            ...currentState.emergingSignals,
            items: updatedEmergingSignals
        },
        causalLinks: updatedCausalLinks,
        calibration: {
            ...currentState.calibration,
            overconfidenceScore: newOverconfidence,
            underconfidenceScore: newUnderconfidence,
            history: newCalibrationHistory,
        },
        missReview: {
            title: currentState.missReview?.title || "Agent Miss Review",
            description: currentState.missReview?.description || "A log of instances where agent analysis failed, and the corrective adjustments made by the system.",
            reports: [...newMissReports, ...(currentState.missReview?.reports || [])].slice(0, 10), // keep last 10
        }
    },
  };

  return update;
}
