'use client';

import {createContext, useContext} from 'react';
import type {BoardState, AgentLogEntry} from '@/lib/types';
import {initialState} from '@/lib/initial-state';

export const STORE_KEY = 'fracture-board-state';

// Reducer actions
export type Action = 
    | { type: 'SET_STATE'; payload: BoardState }
    | { type: 'MERGE_STATE'; payload: Partial<BoardState> }
    | { type: 'ADD_LOG_ENTRY'; payload: AgentLogEntry }
    | { type: 'ADD_LOG_ENTRIES'; payload: AgentLogEntry[] }
    | { type: 'ADD_PROCESSED_GUIDS'; payload: string[] }
    | { type: 'SIMULATE_SCENARIO'; payload: { kineticTempo: number; narrativeDrift: number; cooperationLevel: number; } }
    | { type: 'INJECT_RESIDUE'; payload: { type: 'cooperation' | 'betrayal' | 'shock'; amount: number } }
    | { type: 'UPDATE_OPERATOR_INTENT'; payload: Partial<BoardState['operatorIntent']> };

// Reducer function
export function boardReducer(state: BoardState, action: Action): BoardState {
    switch (action.type) {
        case 'SET_STATE':
            return action.payload;
        case 'MERGE_STATE':
            return { ...state, ...action.payload };
        case 'ADD_LOG_ENTRY':
            return {
                ...state,
                eventLog: [...state.eventLog, action.payload].slice(-100) // Keep last 100 logs
            };
        case 'ADD_LOG_ENTRIES':
             return {
                ...state,
                eventLog: [...state.eventLog, ...action.payload].slice(-100)
            };
        case 'ADD_PROCESSED_GUIDS':
            const newGuids = new Set([...(state.processedGuids || []), ...action.payload]);
            return {
                ...state,
                processedGuids: Array.from(newGuids).slice(-200) // Keep last 200 to prevent memory leak
            };
        case 'SIMULATE_SCENARIO': {
            const { kineticTempo, narrativeDrift, cooperationLevel } = action.payload;
            const getTrend = (oldValue: number, newValue: number): ('up' | 'down' | 'stable') => {
                if (newValue > oldValue) return 'up';
                if (newValue < oldValue) return 'down';
                return 'stable';
            }
            return {
                ...state,
                globalPulse: {
                    ...state.globalPulse,
                    kineticTempo: {
                        ...state.globalPulse.kineticTempo,
                        value: kineticTempo,
                        trend: getTrend(state.globalPulse.kineticTempo.value, kineticTempo),
                    },
                    narrativeDrift: {
                        ...state.globalPulse.narrativeDrift,
                        value: narrativeDrift,
                        trend: getTrend(state.globalPulse.narrativeDrift.value, narrativeDrift),
                    },
                    cooperationLevel: {
                        ...state.globalPulse.cooperationLevel,
                        value: cooperationLevel,
                        trend: getTrend(state.globalPulse.cooperationLevel.value, cooperationLevel),
                    }
                },
                eventLog: [...state.eventLog, { agent: "Simulation", message: `Scenario injected: Kinetic=${kineticTempo.toFixed(1)}, Narrative=${narrativeDrift.toFixed(1)}, Cooperation=${cooperationLevel.toFixed(1)}`, timestamp: new Date().toISOString() }].slice(-100)
            };
        }
        case 'INJECT_RESIDUE': {
            const { type, amount } = action.payload;
            if (!(type in state.memory.residue)) return state;

            const currentResidue = state.memory.residue[type as keyof typeof state.memory.residue];
            const newResidueValue = Math.min(100, Math.max(0, currentResidue + amount));
            
            return {
                ...state,
                memory: {
                    ...state.memory,
                    residue: {
                        ...state.memory.residue,
                        [type]: newResidueValue,
                    }
                },
                eventLog: [...state.eventLog, { agent: "Simulation", message: `Injected ${amount > 0 ? '+' : ''}${amount} ${type} residue.`, timestamp: new Date().toISOString() }].slice(-100)
            };
        }
        case 'UPDATE_OPERATOR_INTENT': {
            const newIntent = {
                ...state.operatorIntent,
                ...action.payload,
            };
            const changedKeys = Object.keys(action.payload).join(', ');

            return {
                ...state,
                operatorIntent: newIntent,
                eventLog: [...state.eventLog, { agent: "Operator", message: `Intent updated: ${changedKeys}.`, timestamp: new Date().toISOString() }].slice(-100)
            };
        }
        default:
            return state;
    }
}

// Context
export const BoardStateContext = createContext<BoardState>(initialState);
export const BoardDispatchContext = createContext<React.Dispatch<Action>>(() => null);

// Hooks to use in components
export function useBoardState() {
    return useContext(BoardStateContext);
}

export function useBoardDispatch() {
    return useContext(BoardDispatchContext);
}
