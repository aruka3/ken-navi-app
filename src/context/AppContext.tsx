import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, LandData, LandInfo, ApplicationCard, ProjectPhase } from '../types';

type AppAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_LAND_DATA'; payload: LandData }
  | { type: 'SET_LAND_INFO'; payload: LandInfo }
  | { type: 'SET_APPLICATIONS'; payload: ApplicationCard[] }
  | { type: 'SET_PHASE'; payload: string }
  | { type: 'SET_SCHEDULE'; payload: ProjectPhase[] }
  | { type: 'RESET' };

const initialState: AppState = {
  currentStep: 0,
  landData: null,
  landInfo: null,
  selectedApplications: [],
  selectedPhase: '',
  projectSchedule: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LAND_DATA':
      return { ...state, landData: action.payload };
    case 'SET_LAND_INFO':
      return { ...state, landInfo: action.payload };
    case 'SET_APPLICATIONS':
      return { ...state, selectedApplications: action.payload };
    case 'SET_PHASE':
      return { ...state, selectedPhase: action.payload };
    case 'SET_SCHEDULE':
      return { ...state, projectSchedule: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}