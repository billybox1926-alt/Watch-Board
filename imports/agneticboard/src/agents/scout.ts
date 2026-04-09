import type { RawSignal, Event } from '@/lib/types';
import { normalizeIncomingSignal } from '@/lib/events';

const potentialSignals: RawSignal[] = [
  { source: 'Kinetic Feed', title: 'Unusual Troop Movement', content: 'Unusual troop movement detected near border.', actor: 'Unknown Military Unit', domain: 'military', location: 'Northern Border Sector 7' },
  { source: 'Decision Layer', title: 'Hardliner Demand', content: 'Hardliner faction issues public demand for action.', actor: 'Hardliners', domain: 'diplomatic', location: 'Capital City' },
  { source: 'Gameboard', title: 'Ally Breaks Ranks', content: 'Ally breaks ranks on joint statement.', actor: 'French Mediation', domain: 'diplomatic', location: 'International Forum' },
  { source: 'Reality Anchor', title: 'Infrastructure Strain', content: 'Civilian infrastructure shows signs of strain.', actor: 'Civilian Population', domain: 'infrastructure', location: 'Eastern Province' },
  { source: 'Context Engine', title: 'Narrative Divergence', content: 'Official narrative diverges from observed events.', actor: 'State Media', domain: 'narrative', location: 'Nation-wide' },
  { source: 'Kinetic Feed', title: 'Air Defense Activation', content: 'Air defense systems activated in a border region.', actor: '3rd Air Defense Battalion', domain: 'military', location: 'Southern Border' },
  { source: 'Decision Layer', title: 'Ceasefire Proposal', content: 'Mediator proposes a 24-hour ceasefire.', actor: 'Dermer', domain: 'diplomatic', location: 'Negotiation Channel' },
  { source: 'Gameboard', title: 'Peace Talks Offer', content: 'Neutral nation offers to host peace talks.', actor: 'Neutral Nation Envoy', domain: 'diplomatic', location: 'Geneva' },
  { source: 'Absence Detector', title: 'No Retaliatory Strike', content: 'Expected retaliatory strike has not occurred.', actor: '4th Strike Wing', domain: 'military', location: 'Airbase Sierra' },
];

type CollectorResult = {
  event: Event;
  log: string;
  rawSignal: RawSignal;
  newGuids: string[];
  metrics: {
    incoming: number;
    processed: number;
    backlog: number;
  };
};


async function getSyntheticEvent(): Promise<CollectorResult> {
    const rawSignal = potentialSignals[Math.floor(Math.random() * potentialSignals.length)];
    const log = `No new external signals found. Using internal synthetic signal: "${rawSignal.title}".`;
    
    const event = normalizeIncomingSignal(rawSignal);
    event.tags.push('synthetic');

    return { 
      event, 
      log, 
      rawSignal, 
      newGuids: [],
      metrics: { incoming: 0, processed: 1, backlog: 0 } 
    };
}


/**
 * Collector Agent: Fetches signals from external (RSS) and internal sources,
 * deduplicates them, and provides one new event per cycle for processing.
 */
export async function collectorAgent(
    allEvents: Event[], 
    processedGuids: string[] = []
): Promise<CollectorResult> {
  try {
    const response = await fetch('/api/rss', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch RSS, status: ${response.status}`);
    }
    const data = await response.json();

    const existingGuids = new Set([...processedGuids, ...allEvents.map(e => e.guid).filter(Boolean)]);

    // Filter for items that are not yet processed.
    const newItems = data.items.filter((item: any) => item.guid && !existingGuids.has(item.guid));
    
    // Process only top N signals per cycle (as user requested)
    const INGESTION_LIMIT = 1;
    const itemsToProcess = newItems.slice(0, INGESTION_LIMIT);

    if (itemsToProcess.length > 0) {
        const itemToProcess = itemsToProcess[0]; // Process the single newest item
        
        const rawSignal: RawSignal = {
            source: `${itemToProcess.source} (RSS)`,
            title: itemToProcess.title,
            content: itemToProcess.content,
            guid: itemToProcess.guid,
            timestamp: itemToProcess.pubDate,
        };
        
        const event = normalizeIncomingSignal(rawSignal);
        event.tags.push('real'); // Tag as a real-world event
        
        const log = `Ingested 1 new signal from ${rawSignal.source}. Backlog: ${newItems.length - 1}.`;
        
        return {
            event,
            log,
            rawSignal,
            newGuids: [itemToProcess.guid], // Return the GUID of the processed item
            metrics: { 
              incoming: newItems.length, 
              processed: itemsToProcess.length, 
              backlog: newItems.length - itemsToProcess.length 
            }
        };
    } else {
        // If no new items, fallback to synthetic
        return getSyntheticEvent();
    }
  } catch (error) {
    console.error("Collector agent failed to fetch external signals:", error);
    const log = `Error fetching external signals: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to synthetic signal.`;
    const synthetic = await getSyntheticEvent();
    return { ...synthetic, log: `${log} ${synthetic.log}` };
  }
}
