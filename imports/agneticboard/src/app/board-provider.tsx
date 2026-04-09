'use client';
import { useReducer, useEffect } from 'react';
import { initialState } from '@/lib/initial-state';
import { 
    boardReducer, 
    BoardStateContext, 
    BoardDispatchContext,
    STORE_KEY
} from '@/hooks/use-board-store';

export function BoardProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(boardReducer, initialState);

    useEffect(() => {
        try {
            const storedState = localStorage.getItem(STORE_KEY);
            if (storedState) {
                const parsed = JSON.parse(storedState);
                if (parsed.title === "Fracture Board") {
                    // We merge with initialState to ensure all properties are present
                    // in case the stored state is from an older version of the app.
                    dispatch({ type: 'SET_STATE', payload: { ...initialState, ...parsed } });
                }
            }
        } catch (error) {
            console.error("Error loading state from localStorage, using initial state.", error);
        }
    }, []); // Empty dependency array ensures this runs only once on the client, after initial render.

    useEffect(() => {
        // This effect will run on the client after the state is initialized or updated.
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Error saving state to localStorage", error);
        }
    }, [state]);

    return (
        <BoardStateContext.Provider value={state}>
            <BoardDispatchContext.Provider value={dispatch}>
                {children}
            </BoardDispatchContext.Provider>
        </BoardStateContext.Provider>
    );
}
