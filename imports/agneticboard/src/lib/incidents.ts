import type { Event, Incident } from './types';
import { simpleUUID } from './events';

const TIME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const SIGNIFICANT_KEYWORD_THRESHOLD = 2;

// Simple stop words list
const STOP_WORDS = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'for', 'to', 'with', 'and', 'or', 'is', 'are', 'was', 'were']);

function getKeywords(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    );
}

function calculateSimilarity(event: Event, incident: Incident, allEvents: Event[]): number {
    let score = 0;
    const incidentEvents = incident.linkedEvents.map(id => allEvents.find(e => e.id === id)).filter(Boolean) as Event[];

    // Time proximity
    const incidentLastUpdated = new Date(incident.lastUpdated).getTime();
    const eventTime = new Date(event.timestamp).getTime();
    if (Math.abs(eventTime - incidentLastUpdated) < TIME_WINDOW_MS) {
        score += 0.4;
    }

    // Actor overlap
    const eventActors = Array.isArray(event.actor) ? event.actor : [event.actor];
    if (incident.actors.some(actor => eventActors.includes(actor))) {
        score += 0.4;
    }

    // Keyword overlap
    const eventKeywords = getKeywords(event.title + ' ' + event.description);
    const incidentKeywords = new Set<string>();
    incidentEvents.forEach(e => {
        getKeywords(e.title + ' ' + e.description).forEach(kw => incidentKeywords.add(kw));
    });

    let commonKeywords = 0;
    eventKeywords.forEach(kw => {
        if (incidentKeywords.has(kw)) {
            commonKeywords++;
        }
    });

    if (commonKeywords >= SIGNIFICANT_KEYWORD_THRESHOLD) {
        score += 0.3;
    }

    return score;
}

function recalculateIncident(incident: Incident, allEvents: Event[]): Incident {
    const now = new Date();
    const linkedEvents = incident.linkedEvents.map(id => allEvents.find(e => e.id === id)).filter(Boolean) as Event[];
    
    if (linkedEvents.length === 0) {
        return incident;
    }

    const allActors = new Set<string>();
    const allDomains = new Set<Event['domain']>();
    let totalSeverity = 0;
    let totalNovelty = 0;
    let totalWeight = 0;

    const getWeight = (timestamp: string) => {
        const ageMs = now.getTime() - new Date(timestamp).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        // Half-life of 48 hours for incident relevance
        return Math.exp(-0.693 * ageHours / 48);
    };

    linkedEvents.forEach(e => {
        (Array.isArray(e.actor) ? e.actor : [e.actor]).forEach(a => allActors.add(a));
        allDomains.add(e.domain);
        
        const weight = getWeight(e.timestamp);
        totalSeverity += e.severity * weight;
        totalNovelty += e.novelty * weight;
        totalWeight += weight;
    });
    
    const weightedAvgSeverity = totalWeight > 0 ? totalSeverity / totalWeight : 0;
    const weightedAvgNovelty = totalWeight > 0 ? totalNovelty / totalWeight : 0;
    
    // Spread bonus, also weighted by recency of events
    const spreadBonus = Math.min(totalWeight / 10, 0.3);

    const attentionScore = parseFloat(((weightedAvgSeverity * 0.5) + (weightedAvgNovelty * 0.2) + spreadBonus).toFixed(2));

    const mostRecentEvent = [...linkedEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    let newTitle = mostRecentEvent.title;
    let newSummary = mostRecentEvent.description.substring(0, 100) + '...';

    if (linkedEvents.length > 3) {
        const actors = Array.from(allActors);
        const domains = Array.from(allDomains);
        const domainCounts: {[key: string]: number} = {};
        domains.forEach(d => {
            const count = linkedEvents.filter(e => e.domain === d).length;
            domainCounts[d] = count;
        });
        const mainDomain = Object.keys(domainCounts).sort((a, b) => domainCounts[b] - domainCounts[a])[0];

        if (mainDomain && actors.length > 0) {
            newTitle = `Coordinated ${mainDomain} pattern by ${actors.slice(0,2).join(' & ')}`;
        } else if (mainDomain) {
            newTitle = `Sustained activity in ${mainDomain} domain`;
        } else {
             newTitle = `Complex multi-domain activity pattern`;
        }

        const keywordCounts: { [key: string]: number } = {};
        linkedEvents.forEach(e => {
            getKeywords(e.title).forEach(kw => {
                keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
            });
        });
        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(e => e[0]);

        newSummary = `A pattern of ${linkedEvents.length} events has emerged, primarily involving themes of: ${topKeywords.join(', ')}.`;
    }

    return {
        ...incident,
        title: newTitle,
        summary: newSummary,
        actors: Array.from(allActors),
        domains: Array.from(allDomains),
        attentionScore,
        lastUpdated: now.toISOString(),
    };
}


export function clusterAndScoreIncidents(event: Event, currentIncidents: Incident[], allEvents: Event[]): Incident[] {
    const SIMILARITY_THRESHOLD = 0.6; // Threshold to be considered part of an incident
    let bestMatch: Incident | null = null;
    let highestScore = 0;

    const allEventsWithNew = [...allEvents, event];

    // Find best matching incident
    for (const incident of currentIncidents) {
        const score = calculateSimilarity(event, incident, allEvents);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = incident;
        }
    }

    if (bestMatch && highestScore >= SIMILARITY_THRESHOLD) {
        // Merge with existing incident
        const updatedIncidents = currentIncidents.map(inc => {
            if (inc.id === bestMatch!.id) {
                const updatedIncident = {
                    ...inc,
                    linkedEvents: [...inc.linkedEvents, event.id],
                };
                return recalculateIncident(updatedIncident, allEventsWithNew);
            }
            return inc;
        });
        return updatedIncidents;
    } else {
        // Create a new incident
        const newIncident: Incident = {
            id: simpleUUID(),
            title: event.title,
            summary: event.description.substring(0, 100) + '...',
            linkedEvents: [event.id],
            actors: Array.isArray(event.actor) ? event.actor : [event.actor],
            domains: [event.domain],
            attentionScore: parseFloat(((event.severity * 0.5) + (event.novelty * 0.2)).toFixed(2)),
            lastUpdated: event.timestamp,
        };
        return [...currentIncidents, recalculateIncident(newIncident, allEventsWithNew)];
    }
}
