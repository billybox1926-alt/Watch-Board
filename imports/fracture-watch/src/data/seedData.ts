import type {
  MetricCard, PulseItem, IntelCard, TripwireItem,
  PropagationStage, Scenario, Snapshot, DecisiveQuestion,
  DeltaItem, FalsificationTest
} from "./types";

export const metrics: MetricCard[] = [
  { id: "m1", title: "Composite Risk", value: "78 / 100", status: "Red", delta: "+6 since 72h" },
  { id: "m2", title: "Lead Fracture", value: "Hormuz Corridor", status: "Red" },
  { id: "m3", title: "Throughput Collapse", value: "34% below baseline", status: "Amber", delta: "Narrowing" },
  { id: "m4", title: "Diplomacy", value: "Procedural Only", status: "Mixed" },
];

export const pulseItems: PulseItem[] = [
  { id: "p1", text: "Hormuz insurance premiums +40% overnight. Crew refusal reports from two operators.", status: "Red", timestamp: "12 min ago", section: "Chokepoints" },
  { id: "p2", text: "UNSC draft detected — procedural framing, no relief provisions.", status: "Amber", timestamp: "34 min ago", section: "War Layer" },
  { id: "p3", text: "Rotterdam ethylene inventory under 9-day buffer. No restocking signal.", status: "Amber", timestamp: "1h ago", section: "Fracture Pillars" },
];

export const recentDeltas: DeltaItem[] = [
  { id: "d1", text: "Insurance +40% — two underwriters pausing Hormuz coverage", timestamp: "12 min ago", direction: "up" },
  { id: "d2", text: "Rotterdam ethylene buffer below 9 days", timestamp: "1h ago", direction: "down" },
  { id: "d3", text: "UNSC draft circulated — no enforcement provisions", timestamp: "34 min ago", direction: "neutral" },
  { id: "d4", text: "Third operator rerouting via Cape confirmed", timestamp: "2h ago", direction: "up" },
];

export const falsificationTests: FalsificationTest[] = [
  { id: "f1", test: "Safe-passage language in official state-to-state comms", status: "Amber", result: "Not observed. Procedural language only." },
  { id: "f2", test: "Throughput recovers above 85% for 48+ consecutive hours", status: "Red", result: "Currently at 66%. No recovery trajectory." },
  { id: "f3", test: "Insurance premiums normalize below +10% pre-crisis", status: "Red", result: "Premiums at +40%. Market in stress." },
  { id: "f4", test: "All major operators resume normal Hormuz transits", status: "Red", result: "Two operators rerouting. One more considering." },
  { id: "f5", test: "72h window with zero interdiction or threat events", status: "Watching", result: "Last event 18h ago. Insufficient window." },
];

export const boardRating = {
  posture: "Operational Red" as const,
  headline: "Corridor Degraded — Selective Passage Regime Active",
  rationale: "Hormuz is functionally degraded under selective passage. 34% throughput collapse, spiking insurance, no diplomatic relief. Coercive but calibrated — below collective defense threshold, above normal commercial operations.",
  leadLane: "Hormuz Corridor — selective interdiction consistent with calibrated coercion. Insurance and crew markets under acute stress.",
  nextTripwire: "Named Maritime Casualty — no confirmed event, near-miss frequency increasing.",
  holdCondition: "Holds unless export infrastructure strikes become repeat behavior or a named maritime casualty is confirmed.",
};

export const overviewConditions: PulseItem[] = [
  { id: "oc1", text: "Strait functionally degraded. Selective passage regime — not a blockade, but not open transit.", status: "Red", timestamp: "08:41 UTC" },
  { id: "oc2", text: "Cape fallback absorbs partial flow, extends lead times 12–18 days for Europe-bound cargo.", status: "Amber", timestamp: "08:22 UTC" },
  { id: "oc3", text: "No named casualties. Watching for first unmistakable maritime or industrial loss.", status: "Watching", timestamp: "07:55 UTC" },
  { id: "oc4", text: "Diplomatic channels open, producing procedural language only. No back-channel relief detected.", status: "Mixed", timestamp: "07:30 UTC" },
];

export const decisiveQuestions: DecisiveQuestion[] = [
  { id: "dq1", question: "Has any named vessel been struck, sunk, or seized?", status: "Watching", answer: "No confirmed casualty. Several near-miss reports unverified." },
  { id: "dq2", question: "Is safe-passage language appearing in official channels?", status: "Amber", answer: "Procedural language only. No explicit safe-passage terms." },
  { id: "dq3", question: "Has a downstream industrial casualty been attributed?", status: "Watching", answer: "Board still needs the first unmistakable named downstream casualty." },
  { id: "dq4", question: "Are escort operations being discussed or deployed?", status: "Tripwire", answer: "Naval posture defensive. No convoy or escort mandate announced." },
  { id: "dq5", question: "Is there a pattern of export infrastructure strikes?", status: "Red", answer: "Three confirmed strikes on port-adjacent storage. Pattern emerging." },
];

export const stressorCards: IntelCard[] = [
  { id: "s1", title: "Maritime Insurance Stress", status: "Red", summary: "War-risk premiums spiked sharply. Several underwriters pausing new Hormuz coverage.", signalMatters: "Premium spikes precede route abandonment. Watch for operator withdrawal.", category: "Overview" },
  { id: "s2", title: "Crew Availability Pressure", status: "Amber", summary: "Crew refusal rates climbing. Two firms offering hazard premiums to retain personnel.", signalMatters: "Crew refusal is a leading indicator of functional route closure.", category: "Overview" },
  { id: "s3", title: "Diplomatic Signal Quality", status: "Mixed", summary: "Multiple statements detected, content analysis shows procedural framing only.", signalMatters: "Procedural language without relief provisions indicates theater, not de-escalation.", category: "Overview" },
];

export const warLayerCards: IntelCard[] = [
  { id: "wl1", title: "Operational Posture", status: "Red", summary: "Active coercive posture. Selective interdiction consistent with pressure campaign, not full closure.", interpretation: "Calibrated coercion — enough to degrade throughput without triggering collective defense.", evidence: ["Three interdiction events in 72h", "No boarding of NATO-flagged vessels", "Targeting commercial neutrals"] },
  { id: "wl2", title: "Lead Stress Lane", status: "Red", summary: "Hormuz remains primary fracture point. Secondary stress on Bab el-Mandeb not yet critical.", interpretation: "Corridor functionally degraded, not truly reopened. Transit possible but costly.", evidence: ["Insurance +40% in 48h", "Transit delay 6–8 hours average", "Two operators rerouting via Cape"] },
  { id: "wl3", title: "Diplomatic Tone", status: "Mixed", summary: "Backchannel activity detected. All public statements remain procedural.", interpretation: "Diplomacy active but not productive. Gap between procedural and substantive remains wide.", evidence: ["UNSC draft — no enforcement provisions", "Regional mediator statements formulaic", "No joint principal statement"] },
  { id: "wl4", title: "Command Stability", status: "Amber", summary: "Decision-making centralized and coherent. No fragmentation or rogue action.", interpretation: "Centralized command reduces miscalculation risk but increases deliberate escalation capacity.", evidence: ["Consistent interdiction pattern", "No contradictory signals", "Escalation ladder appears controlled"] },
];

export const chokepointCards: IntelCard[] = [
  { id: "cp1", title: "Strait of Hormuz", status: "Red", summary: "Functionally degraded. Selective passage regime — not blockade, not open.", interpretation: "Being used as pressure instrument. Calibrated approach harder to counter than full closure.", evidence: ["34% throughput reduction", "Insurance market stressed", "Crew refusal from two operators"] },
  { id: "cp2", title: "Bab el-Mandeb", status: "Amber", summary: "Elevated risk, transit continuing. Secondary insurance pressure from adjacent activity.", interpretation: "Not at crisis threshold but compounds Hormuz stress cumulatively.", evidence: ["Premium uplift +15% this week", "No direct interdiction", "Elevated naval presence"] },
  { id: "cp3", title: "Cape Route Fallback", status: "Watching", summary: "Absorbing diverted traffic. Adds 12–18 days to European deliveries. Port congestion emerging.", interpretation: "Fallback softens the blow without restoring ordinary throughput. Buys time only.", evidence: ["Cape transits +28% MoM", "Durban/Cape Town berth delays", "Fuel costs up significantly"] },
  { id: "cp4", title: "Suez Canal", status: "Watching", summary: "Operating normally. Traffic patterns shifting as operators pre-position for alternatives.", interpretation: "Not stressed itself but role changes if Hormuz degradation persists.", evidence: ["Transit volumes stable", "Forward booking hedging visible", "No physical security concerns"] },
];

export const fracturePillarCards: IntelCard[] = [
  { id: "fp1", title: "Industrial Integrity", status: "Amber", summary: "European petrochemical chains showing early stress. No shutdowns yet, inventory drawdown accelerating.", interpretation: "Industrial base consuming buffers. Question is whether restocking occurs before thresholds breach.", evidence: ["Ethylene crackers at 85% — feedstock constrained", "Naphtha spot +18% in two weeks", "No force majeure declarations"] },
  { id: "fp2", title: "Energy Buffer", status: "Amber", summary: "Strategic reserves adequate 60+ days. Commercial inventories thinning faster than seasonal norms.", interpretation: "Reserves mask urgency. SPR drawdown decision would itself be a major signal.", evidence: ["IEA SPR at 92%", "Commercial crude -4% below 5yr avg", "Refinery margins widening"] },
  { id: "fp3", title: "Chemicals Stress", status: "Watching", summary: "Specialty chemical supply tightening. Pharma and agri-chem inputs on watch.", interpretation: "Slow-burn fracture lane. Lower visibility than energy but consequences acute and hard to reverse.", evidence: ["TDI prices firming in EU spot", "Two specialty gas suppliers issuing allocation warnings", "Agri-chem delivery uncertainty"] },
  { id: "fp4", title: "Critical Inputs", status: "Mixed", summary: "Rare earth and catalyst supply stable but contingent on Chinese export flow.", interpretation: "Not stressed but represents latent coupling risk if conflict scope widens.", evidence: ["No export restrictions", "Processor inventory adequate 30 days", "Political rhetoric hasn't targeted this vector"] },
  { id: "fp5", title: "Downstream Canaries", status: "Watching", summary: "No consumer-facing price signals. B2B renegotiations beginning in select sectors.", interpretation: "Board still needs the first unmistakable named downstream casualty.", evidence: ["No retail price spikes attributed", "B2B logistics surcharges appearing", "JIT manufacturers extending safety stock"] },
];

export const tripwires: TripwireItem[] = [
  { id: "tw1", title: "Named Maritime Casualty", status: "Watching", description: "Confirmed named vessel struck, sunk, or seized with crew casualties or total loss.", whyItMatters: "Would sharply raise escort pressure, trigger insurance seizure, force political response.", implication: "Would trigger escort discussions, emergency UNSC session, potential coalition.", boardChange: "Rerates to Critical. All downstream assumptions reassessed.", direction: "escalation" },
  { id: "tw2", title: "Tanker Sinking", status: "Watching", description: "Laden tanker sunk or catastrophically damaged, creating supply loss and environmental emergency.", whyItMatters: "Combines supply shock with environmental crisis. Dual-track escalation.", implication: "Accelerates route closure, environmental response, potential use-of-force authorization.", boardChange: "Rerates to Critical. Scenario shifts to Maritime Escalation.", direction: "escalation" },
  { id: "tw3", title: "Safe-Passage Language", status: "Amber", description: "Explicit safe-passage or humanitarian corridor language in official state-to-state comms.", whyItMatters: "First concrete de-escalation indicator. Shifts posture from coercion to negotiation.", implication: "Structured exceptions reduce insurance pressure, restore partial flow.", boardChange: "Board considers Amber. Insurance responds within 24–48h.", direction: "downgrade" },
  { id: "tw4", title: "Infrastructure Strike Pattern", status: "Red", description: "Systematic strikes targeting port infrastructure, loading terminals, or storage.", whyItMatters: "Indicates intent for lasting supply disruption beyond transit interference.", implication: "Assessment shifts from transit risk to structural damage. Recovery extends to months.", boardChange: "Rerates to Critical. Industrial damage timeline collapses.", direction: "escalation" },
  { id: "tw5", title: "Downstream Industrial Casualty", status: "Watching", description: "Major facility shutdown or force majeure directly attributed to the disruption.", whyItMatters: "Confirms propagation. Transforms from shipping problem to industrial security problem.", implication: "Widens political response scope. G7 coordination likely.", boardChange: "Confirms propagation. Political pressure intensifies.", direction: "escalation" },
];

export const propagationStages: PropagationStage[] = [
  { id: "ps1", stage: 1, title: "Event Origin", description: "Coercive action in the corridor creates initial disruption signal.", status: "Red", latency: "Immediate", coupling: "Direct — physical transit control", active: true },
  { id: "ps2", stage: 2, title: "Route Disruption", description: "Shipping reroutes or suspends. Insurance spikes. Crew availability tightens.", status: "Red", latency: "24–72h", coupling: "Strong — insurance and operator cascades", active: true },
  { id: "ps3", stage: 3, title: "Inventory Drawdown", description: "Downstream inventories deplete. Spot prices rise. Forward contracts reprice.", status: "Amber", latency: "1–3 weeks", coupling: "Moderate — buffered by stocks", active: true },
  { id: "ps4", stage: 4, title: "Industrial Stress", description: "Manufacturing inputs constrained. Production throttled. Allocation begins.", status: "Watching", latency: "3–8 weeks", coupling: "Variable — sector-dependent", active: false },
  { id: "ps5", stage: 5, title: "Public Impact", description: "Consumer prices affected. Political pressure mounts. Narrative shifts to domestic cost.", status: "Watching", latency: "6–16 weeks", coupling: "Weak, then rapid at threshold", active: false },
];

export const scenarios: Scenario[] = [
  {
    id: "sc1", name: "Coercive Procedure", likelihood: "Red",
    description: "Sustained selective interdiction without closure. Calibrated pressure to extract concessions while avoiding collective defense triggers.",
    consequences: {
      shipping: "15–35% throughput reduction. Elevated premiums. Operator bifurcation.",
      oil: "Moderate uplift (10–20%). Reserves adequate. Spot volatility elevated.",
      diplomacy: "Procedural engagement. Backchannel active but unproductive.",
      industrial: "Slow inventory erosion. Sector stress within 4–6 weeks.",
      escort: "Naval presence maintained. No convoy mandate. Political reluctance.",
    },
    severityScores: { shipping: 4, oil: 3, diplomacy: 2, industrial: 3, escort: 2 },
  },
  {
    id: "sc2", name: "Industrial Squeeze", likelihood: "Amber",
    description: "Disruption persists to cause confirmed downstream casualties. Multiple force majeure declarations. Political pressure intensifies.",
    consequences: {
      shipping: "Route functionally abandoned by major operators. Cape default.",
      oil: "Sharp spike (25–45%). SPR drawdown discussions. OPEC+ emergency.",
      diplomacy: "Crisis diplomacy activated. G7 energy security coordination.",
      industrial: "Multiple plant shutdowns in European petrochemical corridor.",
      escort: "Escort discussions formalize. Coalition task force proposed.",
    },
    severityScores: { shipping: 7, oil: 6, diplomacy: 5, industrial: 7, escort: 5 },
  },
  {
    id: "sc3", name: "Maritime Escalation", likelihood: "Watching",
    description: "Named maritime casualty triggers rapid escalation. Military response activated. Insurance seizes. Supply chain emergency.",
    consequences: {
      shipping: "Effective route closure. Global shipping reorientation.",
      oil: "Spike exceeds 50%. Emergency reserves released. Demand destruction.",
      diplomacy: "UNSC emergency. Use-of-force debated. Alliance obligations invoked.",
      industrial: "Cascading failure across energy-dependent sectors. Recovery in quarters.",
      escort: "Active military escort. ROE expanded. Direct confrontation risk.",
    },
    severityScores: { shipping: 9, oil: 9, diplomacy: 8, industrial: 9, escort: 9 },
  },
];

export const snapshots: Snapshot[] = [
  { id: "sn1", title: "Morning Assessment", timestamp: "2025-04-03 06:00 UTC", note: "Hormuz degraded. No new events overnight. Insurance elevated. Diplomatic signals unchanged.", posture: "Red", whatChanged: "Overnight calm — no events, no de-escalation." },
  { id: "sn2", title: "Insurance Flash", timestamp: "2025-04-02 14:30 UTC", note: "War-risk premiums +40% on near-miss reports. Partially calmed by London close.", posture: "Red", whatChanged: "Insurance +40%. Two underwriters pausing coverage." },
  { id: "sn3", title: "Diplomatic Update", timestamp: "2025-04-02 09:15 UTC", note: "UNSC draft circulated. Procedural framing, no relief provisions.", posture: "Mixed", whatChanged: "UNSC draft — procedural content only." },
  { id: "sn4", title: "Weekly Posture Review", timestamp: "2025-04-01 18:00 UTC", note: "Risk elevated to 78/100. Hormuz confirmed lead lane. 34% throughput collapse.", posture: "Amber", whatChanged: "Risk index +6. Throughput collapse confirmed." },
];

export const operatorNotes = [
  { id: "on1", text: "Watch Rotterdam ethylene at 7-day threshold — first confirmed downstream marker.", timestamp: "08:45 UTC", author: "Analyst-1" },
  { id: "on2", text: "Diplomatic signal quality deteriorating. More statements, less substance. Classic procedural stall.", timestamp: "07:20 UTC", author: "Analyst-2" },
  { id: "on3", text: "Track whether crew refusal translates to operator route withdrawal this week.", timestamp: "06:55 UTC", author: "Analyst-1" },
  { id: "on4", text: "Silence should be treated as lag until disproven.", timestamp: "06:10 UTC", author: "Analyst-3" },
];

export const globalPulseSummary = {
  headline: "Operational Red — Corridor Degraded, No Tripwires Breached",
  summary: "Hormuz functionally degraded under selective passage. 34% below baseline. Insurance and crew markets stressed. Diplomatic activity procedural only. No named casualties or formal escalation triggers confirmed.",
  watchItems: [
    "Named maritime casualty — immediate board reassessment to Critical.",
    "Rotterdam ethylene 7-day threshold — confirms downstream propagation.",
    "Operator route withdrawal — confirms functional closure.",
    "UNSC language shift from procedural to substantive — de-escalation signal.",
    "Export infrastructure strike frequency — pattern would collapse industrial timeline.",
  ],
  recommendation: "Maintain Red. No tripwires breached. Hold unless maritime casualty confirmed or safe-passage language detected. Next review: 18:00 UTC.",
};
