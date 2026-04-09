'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useBoardDispatch, useBoardState } from './use-board-store';
import { collectorAgent, triageAgent, clusterAgent, redTeamAgent, supervisorBriefAgent, forecastAgent, supervisor } from '@/agents';
import { isDuplicate } from '@/lib/events';
import type { BoardState, AgentLogEntry } from '@/lib/types';

export function useAgentLoop(interval = 10000) {
    const dispatch = useBoardDispatch();
    const state = useBoardState();
    const [isRunning, setIsRunning] = useState(true);
    const isProcessing = useRef(false);

    const runCycle = useCallback(async (boardState: BoardState) => {
        if (isProcessing.current) {
            console.log("Agent cycle already in progress. Skipping.");
            return; // Don't start a new cycle if one is already running
        }
        isProcessing.current = true;

        const cycleLogs: AgentLogEntry[] = [];
        const timestamp = new Date().toISOString();
        const addLog = (agent: string, message: string) => {
            if (message) {
                cycleLogs.push({ agent, message, timestamp });
            }
        };

        const startTime = performance.now();

        try {
            addLog('System', 'Agent cycle starting...');

            // 1. CollectorAgent: Normalize incoming signals
            const collectorResult = await collectorAgent(boardState.events, boardState.processedGuids);
            addLog('Collector', collectorResult.log);
            let event = collectorResult.event;

            // Dispatch newly processed GUIDs to state to prevent re-processing
            if (collectorResult.newGuids && collectorResult.newGuids.length > 0) {
                dispatch({ type: 'ADD_PROCESSED_GUIDS', payload: collectorResult.newGuids });
            }

            // Early exit for duplicates based on title/actor/time (secondary check)
            if (isDuplicate(event, boardState.events)) {
                addLog('Supervisor', `Suppressed duplicate event: "${event.title}"`);
                dispatch({ type: 'ADD_LOG_ENTRIES', payload: cycleLogs });
                isProcessing.current = false;
                return;
            }

            // 2. TriageAgent: Score severity and confidence
            const triageResult = await triageAgent(event, boardState.modules, boardState.events, boardState.operatorIntent);
            addLog('Triage', triageResult.log);
            event = triageResult.event;

            // 3. Ingestion Filter: Quarantine low-confidence signals
            const CONFIDENCE_THRESHOLD = 0.35;
            if (event.confidence < CONFIDENCE_THRESHOLD) {
                addLog('Filter', `Signal "${event.title}" quarantined. Confidence ${event.confidence.toFixed(2)} is below threshold of ${CONFIDENCE_THRESHOLD}.`);
                
                const newQuarantine = [...(boardState.quarantine?.items || []), collectorResult.rawSignal].slice(-20); // Keep last 20
                
                dispatch({ 
                    type: 'MERGE_STATE', 
                    payload: {
                        quarantine: { ...boardState.quarantine, items: newQuarantine },
                        eventLog: [...(boardState.eventLog || []), ...cycleLogs].slice(-100),
                    }
                });

                isProcessing.current = false;
                return;
            }

            // 4. ClusterAgent: Update incidents
            const clusterResult = await clusterAgent(event, boardState.incidents, boardState.events);
            addLog('Cluster', clusterResult.log);

            // 5. SupervisorBriefAgent: Write "what changed"
            const briefResult = await supervisorBriefAgent(event, clusterResult.incidents, boardState);
            addLog('Supervisor', briefResult.log);

            // 6. ForecastAgent: Generate competing hypotheses
            const forecastResult = await forecastAgent(boardState, event, clusterResult.incidents);
            addLog('Forecast', forecastResult.log);
            
            // Create a candidate state for Red Team to critique, including the latest outputs
            const candidateState: BoardState = {
                ...boardState,
                supervisorBrief: briefResult.summary,
                incidents: clusterResult.incidents,
                forecast: forecastResult.forecast,
                events: [...(boardState.events || []), event],
                // Use the brief as a proxy for the thesis that will be generated this cycle
                compositeState: {
                    ...boardState.compositeState,
                    description: briefResult.summary
                }
            };
            
            // 7. RedTeamAgent: Challenge conclusions
            const redTeamResult = await redTeamAgent(candidateState);
            if (redTeamResult.critique) {
                addLog('Red Team', redTeamResult.log);
            }
            
            // 8. Supervisor: Update the final board state
            const supervisorUpdate = await supervisor(
                event, 
                boardState, 
                clusterResult.incidents,
                briefResult.summary,
                redTeamResult.critique,
                forecastResult.forecast
            );
            
            cycleLogs.push(...supervisorUpdate.logs);
            
            const endTime = performance.now();
            const cycleTime = Math.round(endTime - startTime);
            addLog('System', `Agent cycle completed in ${cycleTime}ms.`);

            // Create a temporary state object to avoid passing the large boardState object around
            const updatePayload = {
                ...supervisorUpdate.newState,
                eventLog: [...(boardState.eventLog || []), ...cycleLogs].slice(-100),
                lastAgentOutputs: {
                    collector: {
                        log: collectorResult.log,
                        raw: collectorResult.rawSignal,
                        normalized: collectorResult.event,
                        metrics: collectorResult.metrics,
                    },
                    triage: triageResult.log,
                    cluster: clusterResult.log,
                    redTeam: redTeamResult.critique || "No critiques raised.",
                    supervisorBrief: briefResult.summary,
                    forecast: forecastResult.log,
                    system: {
                        cycleTime,
                    },
                }
            };
            
            dispatch({ type: 'MERGE_STATE', payload: updatePayload });

        } catch(error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Agent cycle failed", error);
            addLog('System', `Agent cycle failed. Check console for details. Error: ${errorMessage}`);
            dispatch({ type: 'ADD_LOG_ENTRIES', payload: cycleLogs });
        } finally {
            isProcessing.current = false;
        }
    }, [dispatch]);

    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);


    useEffect(() => {
        if (!isRunning) return;
        
        const timer = setInterval(() => {
            runCycle(stateRef.current);
        }, interval);

        return () => clearInterval(timer);
    }, [isRunning, interval, runCycle]);

    return { isRunning, setIsRunning };
}
