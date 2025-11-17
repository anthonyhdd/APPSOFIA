export type RootStackParamList = {
  Onboarding: { targetStep?: string } | undefined;
  Home: undefined;
  Lesson: { lessonId?: string };
  LevelSelection: undefined;
  Chat: undefined;
  CallEnd: undefined;
  Quests: undefined;
  Paywall: { fromOnboarding?: boolean } | undefined;
};

