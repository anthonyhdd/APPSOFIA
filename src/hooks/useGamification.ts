import { useCallback } from 'react';
import { useProgress } from './useProgress';
import { Quest } from '../types';

interface UseGamificationReturn {
  completeQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  checkAchievements: () => void;
}

export function useGamification(): UseGamificationReturn {
  const { addGems, addKey, addTrophy, levelUp } = useProgress();

  const completeQuest = useCallback(
    (questId: string) => {
      // TODO: Logique de complétion de quête
      // Pour l'instant, récompense par défaut
      addGems(10);
      addKey();
    },
    [addGems, addKey]
  );

  const updateQuestProgress = useCallback((questId: string, progress: number) => {
    // TODO: Mettre à jour la progression de la quête
  }, []);

  const checkAchievements = useCallback(() => {
    // TODO: Vérifier les achievements et débloquer les récompenses
    // Exemple: Si streak >= 7, débloquer un trophée
  }, []);

  return {
    completeQuest,
    updateQuestProgress,
    checkAchievements,
  };
}







