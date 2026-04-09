import type { RawSignal, Event } from './types';

// This is a simple in-memory implementation. A real system might use a more robust UUID library.
export const simpleUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for non-browser env or older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Keyword maps for inference
const DOMAIN_KEYWORDS: { [key in Event['domain']]: string[] } = {
    military: ['troop', 'military', 'strike', 'air defense', 'battalion', 'wing', 'attack', 'force', 'soldier', 'weapon', 'missile', 'drone', 'retaliatory'],
    economic: ['economic', 'trade', 'sanction', 'market', 'finance', 'currency', 'inflation', 'shipping'],
    narrative: ['narrative', 'statement', 'media', 'reportedly', 'propaganda', 'information', 'diverges'],
    diplomatic: ['diplomatic', 'ceasefire', 'negotiation', 'envoy', 'talks', 'mediation', 'ally', 'ranks', 'deal', 'proposal', 'peace'],
    infrastructure: ['infrastructure', 'desalination', 'port', 'power', 'grid', 'bridge', 'strain'],
};

const ACTOR_KEYWORDS: { [key: string]: string[] } = {
    'Hardliners': ['hardliner', 'faction'],
    'French Mediation': ['french', 'macron', 'paris', 'mediation'],
    'Dermer': ['dermer'],
    'State Media': ['state media', 'official report'],
    '4th Strike Wing': ['4th strike wing'],
    '3rd Air Defense Battalion': ['3rd air defense battalion'],
    'Neutral Nation Envoy': ['neutral nation', 'envoy'],
};


function inferDomain(text: string): Event['domain'] {
    text = text.toLowerCase();
    for (const domain in DOMAIN_KEYWORDS) {
        if (DOMAIN_KEYWORDS[domain as Event['domain']].some(kw => text.includes(kw))) {
            return domain as Event['domain'];
        }
    }
    return 'narrative'; // Default domain
}

function inferActor(text: string): string | string[] {
    text = text.toLowerCase();
    const foundActors = new Set<string>();
    for (const actor in ACTOR_KEYWORDS) {
        if (ACTOR_KEYWORDS[actor].some(kw => text.includes(kw))) {
            foundActors.add(actor);
        }
    }
    if (foundActors.size > 0) {
        return Array.from(foundActors);
    }
    return 'Unknown';
}


export function normalizeIncomingSignal(raw: RawSignal): Event {
  const now = new Date();
  const fullText = `${raw.title || ''} ${raw.content}`;
  
  const event: Event = {
    id: simpleUUID(),
    timestamp: raw.timestamp || now.toISOString(),
    source: raw.source,
    actor: raw.actor || inferActor(fullText),
    domain: raw.domain || inferDomain(fullText),
    location: raw.location || 'Undisclosed',
    title: raw.title || 'Untitled Event',
    description: raw.content,
    severity: 0.5, // Default, to be scored by Analyst
    confidence: 0.5, // Default confidence, to be scored by Analyst. For RSS, this might start lower.
    novelty: 0.5, // Default, to be scored by Analyst
    dependencies: [],
    tags: [],
    guid: raw.guid,
  };
  
  if (raw.source.toLowerCase().includes('rss')) {
    event.confidence = 0.4; // Lower baseline for externally sourced feeds
    event.tags.push('rss-source');
  }

  return event;
}

const DUPLICATE_TIME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function isDuplicate(newEvent: Event, existingEvents: Event[]): boolean {
  if (newEvent.guid) {
      return existingEvents.some(e => e.guid === newEvent.guid);
  }

  // Fallback to naive check if no GUID is present
  return existingEvents.some(existingEvent => {
    const timeDiff = new Date(newEvent.timestamp).getTime() - new Date(existingEvent.timestamp).getTime();
    
    // Naive title similarity check, can be improved with Levenshtein distance etc.
    const titleMatch = newEvent.title.toLowerCase() === existingEvent.title.toLowerCase();
    
    const actorMatch = JSON.stringify(newEvent.actor) === JSON.stringify(existingEvent.actor);

    return titleMatch && actorMatch && timeDiff > 0 && timeDiff < DUPLICATE_TIME_WINDOW_MS;
  });
}
