import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useLanguage } from '../../context/LanguageContext';
import { triggerHapticFeedback } from '../../utils/haptics';
import IconCounter from '../../components/ui/IconCounter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LessonCard {
  id: string;
  level: number;
  title: string;
  imageUrl?: any;
  lessonsCount: number;
  chestCount: number;
  completedLessons: number;
  isLocked: boolean;
}

interface Section {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  progress: number;
  lessons: LessonCard[];
  isLocked: boolean;
}

const sections: Section[] = [
  {
    id: '1',
    number: 1,
    title: 'Section 1',
    subtitle: 'COMMUNICATION ESSENTIELLE',
    progress: 0,
    isLocked: false,
    lessons: [
      {
        id: '1-1',
        level: 1,
        title: 'Vocabulaire de base',
        lessonsCount: 4,
        chestCount: 1,
        completedLessons: 0,
        isLocked: false,
      },
      {
        id: '1-2',
        level: 2,
        title: 'Apprendre la structure des phrases',
        lessonsCount: 4,
        chestCount: 1,
        completedLessons: 0,
        isLocked: true,
      },
      {
        id: '1-3',
        level: 3,
        title: 'Poser et répondre à des questions',
        lessonsCount: 4,
        chestCount: 1,
        completedLessons: 0,
        isLocked: true,
      },
    ],
  },
  {
    id: '2',
    number: 2,
    title: 'Section 2',
    subtitle: 'VOCABULAIRE AVANCÉ',
    progress: 0,
    isLocked: true,
    lessons: [
      {
        id: '2-1',
        level: 4,
        title: 'Expressions courantes',
        lessonsCount: 5,
        chestCount: 2,
        completedLessons: 0,
        isLocked: true,
      },
      {
        id: '2-2',
        level: 5,
        title: 'Conversations formelles',
        lessonsCount: 5,
        chestCount: 2,
        completedLessons: 0,
        isLocked: true,
      },
    ],
  },
  {
    id: '3',
    number: 3,
    title: 'Section 3',
    subtitle: 'GRAMMAIRE AVANCÉE',
    progress: 0,
    isLocked: true,
    lessons: [
      {
        id: '3-1',
        level: 6,
        title: 'Temps verbaux complexes',
        lessonsCount: 6,
        chestCount: 3,
        completedLessons: 0,
        isLocked: true,
      },
    ],
  },
];

export default function LevelSelectionScreen({ navigation }: any) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);

  const handleLessonPress = (lesson: LessonCard) => {
    if (lesson.isLocked) {
      triggerHapticFeedback();
      // TODO: Show locked message or paywall
      return;
    }
    triggerHapticFeedback();
    navigation.navigate('Lesson', { lessonId: lesson.id });
  };

  const handleSectionPress = (section: Section) => {
    if (section.isLocked) {
      triggerHapticFeedback();
      // TODO: Show locked message
      return;
    }
    triggerHapticFeedback();
    setSelectedSection(section);
  };

  // Si une section est sélectionnée, afficher les leçons de cette section
  if (selectedSection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              triggerHapticFeedback();
              setSelectedSection(null);
            }}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.topBarLeft}>
            <Text style={styles.time}>15:39</Text>
            <View style={styles.currencyIcons}>
              <IconCounter icon="💎" value={0} color={colors.text} />
              <IconCounter icon="📜" value={3} color={colors.text} />
              <IconCounter 
                lottieSource={require('../../assets/media/videos/fire.json')} 
                value={2} 
                color={colors.text} 
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              triggerHapticFeedback();
              navigation.goBack();
            }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>{selectedSection.title}</Text>
            <Text style={styles.sectionSubtitle}>{selectedSection.subtitle}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{selectedSection.progress}%</Text>
            </View>
          </View>
        </View>

        {/* Lesson Path */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pathContainer}>
            <View style={styles.pathLine} />
            
            {selectedSection.lessons.map((lesson, index) => (
              <View
                key={lesson.id}
                style={[
                  styles.lessonCardContainer,
                  { marginTop: index === 0 ? 0 : spacing.xl * 2 },
                ]}
              >
                {index % 2 === 0 ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.lessonCard,
                        lesson.isLocked && styles.lessonCardLocked,
                      ]}
                      onPress={() => handleLessonPress(lesson)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>NIV {lesson.level}</Text>
                      </View>
                      <View style={styles.lessonImagePlaceholder}>
                        <Text style={styles.lessonImageText}>📚</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.lessonInfo}>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonCount}>{lesson.lessonsCount} LEÇONS</Text>
                        <View style={styles.chestInfo}>
                          <Text style={styles.chestIcon}>💎</Text>
                          <Text style={styles.chestCount}>{lesson.chestCount}</Text>
                        </View>
                      </View>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.progressCircles}>
                        {Array.from({ length: lesson.lessonsCount }).map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.progressCircle,
                              i < lesson.completedLessons && styles.progressCircleCompleted,
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.lessonInfo}>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonCount}>{lesson.lessonsCount} LEÇONS</Text>
                        <View style={styles.chestInfo}>
                          <Text style={styles.chestIcon}>💎</Text>
                          <Text style={styles.chestCount}>{lesson.chestCount}</Text>
                        </View>
                      </View>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.progressCircles}>
                        {Array.from({ length: lesson.lessonsCount }).map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.progressCircle,
                              i < lesson.completedLessons && styles.progressCircleCompleted,
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.lessonCard,
                        lesson.isLocked && styles.lessonCardLocked,
                      ]}
                      onPress={() => handleLessonPress(lesson)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>NIV {lesson.level}</Text>
                      </View>
                      <View style={styles.lessonImagePlaceholder}>
                        <Text style={styles.lessonImageText}>📚</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Vue principale : liste des sections
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.time}>15:39</Text>
          <View style={styles.currencyIcons}>
            <IconCounter icon="💎" value={0} color={colors.text} />
            <IconCounter icon="📜" value={3} color={colors.text} />
            <IconCounter 
              lottieSource={require('../../assets/media/videos/fire.json')} 
              value={2} 
              color={colors.text} 
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            triggerHapticFeedback();
            navigation.goBack();
          }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Leçons</Text>
        <Text style={styles.mainSubtitle}>Choisissez une section</Text>
      </View>

      {/* Sections List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.sectionsContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionCard,
              section.isLocked && styles.sectionCardLocked,
            ]}
            onPress={() => handleSectionPress(section)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionCardHeader}>
              <View style={styles.sectionCardHeaderLeft}>
                <Text style={styles.sectionCardNumber}>{section.number}</Text>
                <View style={styles.sectionCardInfo}>
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>
                  <Text style={styles.sectionCardSubtitle}>{section.subtitle}</Text>
                </View>
              </View>
              <View style={styles.sectionCardProgress}>
                <View style={styles.sectionProgressRing}>
                  <Text style={styles.sectionProgressText}>{section.progress}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.sectionCardFooter}>
              <Text style={styles.sectionLessonsCount}>
                {section.lessons.length} leçons
              </Text>
              {section.isLocked && (
                <Text style={styles.sectionLockedBadge}>🔒 Verrouillé</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topBarLeft: {
    flex: 1,
  },
  time: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.xs,
  },
  currencyIcons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  pathContainer: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
  },
  pathLine: {
    position: 'absolute',
    left: spacing.lg + 60,
    top: 80,
    bottom: -spacing.xl * 2,
    width: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    opacity: 0.5,
  },
  lessonCardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl * 1.5,
    position: 'relative',
    paddingLeft: spacing.md,
  },
  lessonCard: {
    width: 140,
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...shadows.lg,
    position: 'relative',
  },
  lessonCardLocked: {
    opacity: 0.4,
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: '#000000',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    zIndex: 10,
  },
  levelBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
  lessonImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonImageText: {
    fontSize: 64,
    opacity: 0.3,
  },
  lessonInfo: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  lessonCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
  },
  chestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chestIcon: {
    fontSize: 14,
  },
  chestCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
  },
  lessonTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.sm,
  },
  progressCircles: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressCircleCompleted: {
    backgroundColor: colors.primary,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  mainTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  mainSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
  },
  sectionsContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionCardLocked: {
    opacity: 0.6,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionCardNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    marginRight: spacing.md,
    minWidth: 40,
  },
  sectionCardInfo: {
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  sectionCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCardProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionProgressRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  sectionProgressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: typography.fontFamily.bold,
  },
  sectionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionLessonsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.regular,
  },
  sectionLockedBadge: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontFamily: typography.fontFamily.bold,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  backIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
});
