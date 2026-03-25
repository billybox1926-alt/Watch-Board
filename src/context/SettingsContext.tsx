import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { KeywordGroup } from '../types/article';

interface SettingsState {
  trustedSources: string[];
  watchlists: Record<KeywordGroup, string[]>;
  scoringWeights: {
    keywordMatch: number;
    recency: number;
    trustedSource: number;
  };
}

interface SettingsContextType extends SettingsState {
  addTrustedSource: (source: string) => void;
  removeTrustedSource: (source: string) => void;
  updateWatchlist: (group: KeywordGroup, keywords: string[]) => void;
  updateWeights: (weights: SettingsState['scoringWeights']) => void;
}

const defaultSettings: SettingsState = {
  trustedSources: ['Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal', 'AP'],
  watchlists: {
    'Conflict': ['strike', 'drone', 'missile', 'explosion', 'military', 'reprisal', 'attack'],
    'Nuclear': ['uranium', 'enrichment', 'Natanz', 'IAEA', 'centrifuge', 'Fordow', 'nuclear'],
    'Maritime/Energy': ['Strait of Hormuz', 'oil tanker', 'seized', 'naval', 'crude', 'shipment']
  },
  scoringWeights: {
    keywordMatch: 40,
    recency: 40,
    trustedSource: 20
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const addTrustedSource = (source: string) => {
    setSettings(prev => ({ ...prev, trustedSources: [...prev.trustedSources, source] }));
  };

  const removeTrustedSource = (source: string) => {
    setSettings(prev => ({ ...prev, trustedSources: prev.trustedSources.filter(s => s !== source) }));
  };

  const updateWatchlist = (group: KeywordGroup, keywords: string[]) => {
    setSettings(prev => ({ ...prev, watchlists: { ...prev.watchlists, [group]: keywords } }));
  };

  const updateWeights = (weights: SettingsState['scoringWeights']) => {
    setSettings(prev => ({ ...prev, scoringWeights: weights }));
  };

  return (
    <SettingsContext.Provider value={{ ...settings, addTrustedSource, removeTrustedSource, updateWatchlist, updateWeights }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
