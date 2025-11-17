import { useState, useCallback } from 'react';
import { User } from '../types';

interface UseProgressReturn {
  user: User;
  updateStreak: (days: number) => void;
  addGems: (amount: number) => void;
  addTrophy: () => void;
  addKey: () => void;
  levelUp: () => void;
  resetProgress: () => void;
}

const initialUser: User = {
  id: '1',
  name: 'Anto',
  streak: 1,
  trophies: 0,
  gems: 0,
  level: 1,
  keys: 0,
};

export function useProgress(): UseProgressReturn {
  const [user, setUser] = useState<User>(initialUser);

  const updateStreak = useCallback((days: number) => {
    setUser((prev) => ({ ...prev, streak: days }));
  }, []);

  const addGems = useCallback((amount: number) => {
    setUser((prev) => ({ ...prev, gems: prev.gems + amount }));
  }, []);

  const addTrophy = useCallback(() => {
    setUser((prev) => ({ ...prev, trophies: prev.trophies + 1 }));
  }, []);

  const addKey = useCallback(() => {
    setUser((prev) => ({ ...prev, keys: prev.keys + 1 }));
  }, []);

  const levelUp = useCallback(() => {
    setUser((prev) => ({ ...prev, level: prev.level + 1 }));
  }, []);

  const resetProgress = useCallback(() => {
    setUser(initialUser);
  }, []);

  return {
    user,
    updateStreak,
    addGems,
    addTrophy,
    addKey,
    levelUp,
    resetProgress,
  };
}







