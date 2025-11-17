import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Quest } from '../../types';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useLanguage } from '../../context/LanguageContext';

export default function QuestsScreen({ navigation }: any) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  // Exemple de quêtes
  const quests: Quest[] = [
    {
      id: '1',
      title: t('quests.quest1.title'),
      description: t('quests.quest1.description'),
      reward: { type: 'key', amount: 1 },
      completed: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: '2',
      title: t('quests.quest2.title'),
      description: t('quests.quest2.description'),
      reward: { type: 'gem', amount: 50 },
      completed: false,
      progress: 2,
      maxProgress: 5,
    },
    {
      id: '3',
      title: t('quests.quest3.title'),
      description: t('quests.quest3.description'),
      reward: { type: 'trophy', amount: 1 },
      completed: false,
      progress: 7,
      maxProgress: 10,
    },
  ];

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'gem':
        return '💎';
      case 'key':
        return '🔑';
      case 'trophy':
        return '🏆';
      default:
        return '⭐';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              triggerHapticFeedback();
              navigation.goBack();
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('quests.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {quests.map((quest) => {
            const progressPercentage = quest.progress / quest.maxProgress;
            const isCompleted = quest.completed;

            return (
              <TouchableOpacity
                key={quest.id}
                style={[
                  styles.questCard,
                  isCompleted && styles.questCardCompleted,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <View style={styles.rewardContainer}>
                    <Text style={styles.rewardIcon}>
                      {getRewardIcon(quest.reward.type)}
                    </Text>
                    <Text style={styles.rewardAmount}>{quest.reward.amount}</Text>
                  </View>
                </View>

                <Text style={styles.questDescription}>{quest.description}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressPercentage * 100}%`,
                          backgroundColor: isCompleted
                            ? colors.success
                            : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {quest.progress} / {quest.maxProgress}
                  </Text>
                </View>

                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>{t('quests.completed')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    fontFamily: typography.fontFamily.bold,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    fontFamily: typography.fontFamily.bold,
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  questCardCompleted: {
    opacity: 0.7,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
    fontFamily: typography.fontFamily.bold,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  questDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.bold,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'right',
    fontFamily: typography.fontFamily.bold,
  },
  completedBadge: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.bold,
  },
});

