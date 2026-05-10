import React, { createContext, useContext, useState, useEffect } from 'react';
import { SeasonService } from '../services/season-service';

export interface Season {
  id: string;
  name: string;
}

interface SeasonContextProps {
  seasons: Season[];
  activeSeason: Season | null;
  setActiveSeasonId: (id: string) => void;
  refreshSeasons: () => Promise<void>;
  loading: boolean;
}

const SeasonContext = createContext<SeasonContextProps>({
  seasons: [],
  activeSeason: null,
  setActiveSeasonId: () => {},
  refreshSeasons: async () => {},
  loading: true
});

export const useSeason = () => useContext(SeasonContext);

export const SeasonProvider: React.FC<{ children: React.ReactNode, isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeasonIdState, setActiveSeasonIdState] = useState<string | null>(() => localStorage.getItem('activeSeasonId'));
  const [loading, setLoading] = useState(true);

  const refreshSeasons = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await SeasonService.getAll();
      setSeasons(data);
      if (data.length > 0) {
        if (!activeSeasonIdState || !data.find((s: Season) => s.id === activeSeasonIdState)) {
          setActiveSeasonId(data[0].id);
        }
      } else {
         setActiveSeasonIdState(null);
         localStorage.removeItem('activeSeasonId');
      }
    } catch (e) {
       console.error("Failed to load seasons", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSeasons();
  }, [isAuthenticated]);

  const setActiveSeasonId = (id: string) => {
    setActiveSeasonIdState(id);
    localStorage.setItem('activeSeasonId', id);
  }

  const activeSeason = seasons.find(s => s.id === activeSeasonIdState) || null;

  return (
    <SeasonContext.Provider value={{ seasons, activeSeason, setActiveSeasonId, refreshSeasons, loading }}>
        {children}
    </SeasonContext.Provider>
  );
}
