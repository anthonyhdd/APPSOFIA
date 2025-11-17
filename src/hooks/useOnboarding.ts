import { useState, useCallback } from 'react';
import { OnboardingQuestion } from '../types';

const onboardingQuestions: OnboardingQuestion[] = [
  // 0. Vidéo d'introduction
  {
    id: '0',
    step: 'intro_video',
    type: 'intro_video',
    // Fichier vidéo local
    videoUrl: require('../assets/media/videos/sofiaa.mp4'),
    title: 'Sofia', // Texte à afficher en haut en blanc avec font Canicule Display
  },
  // 1. Niveau en espagnol
  {
    id: '1',
    step: 'spanish_level',
    type: 'spanish_level',
    question: 'What is your level in Spanish?',
    options: ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'],
  },
  // 2. Langue maternelle
  {
    id: '2',
    step: 'native_language',
    type: 'native_language',
    question: 'What is your native language?',
    options: ['English', 'Français', 'Deutsch', 'Italiano', 'Português'],
    flags: ['🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇵🇹'],
  },
  // 3. Nom
  {
    id: '3',
    step: 'name',
    type: 'text',
    question: 'What is your name?',
    placeholder: 'Enter your name',
  },
  // 3a. Slideshow
  {
    id: '3a',
    step: 'slideshow',
    type: 'slideshow',
    title: 'Speak with Sofia',
    subtitle: 'in more than',
    highlightText: 'situations!',
    slides: [
      require('../assets/media/videos/Slide1.png'),
      require('../assets/media/videos/Slide2.png'),
    ],
  },
  // 4. Genre
  {
    id: '4',
    step: 'gender',
    type: 'gender',
    question: 'What is your gender?',
    options: ['Male', 'Female', 'Prefer not to say'],
    icons: ['👨', '👩', '👤'],
  },
  // 5. Âge
  {
    id: '5',
    step: 'age',
    type: 'age',
    question: 'How old are you?',
    options: ['Under 18', '18 - 24', '25 - 34', '35 - 54', '55 and over', 'Prefer not to say'],
    icons: ['👶', '🎓', '💼', '🏠', '👴', '👻'],
  },
  // 5. Comment améliores-tu actuellement ton anglais ?
  {
    id: '5',
    step: 'current_learning',
    type: 'current_learning',
    question: 'How are you currently improving your Spanish?',
    options: [
      'Courses or training',
      'Language apps',
      'Videos or movies',
      'Podcasts or audiobooks',
      'By speaking with other people',
      'I\'m not currently learning',
    ],
    icons: ['📚', '🎯', '🎬', '🎧', '🤝', '❌'],
  },
  // 6. Objectif principal
  {
    id: '6',
    step: 'main_goal',
    type: 'main_goal',
    question: 'What is your main goal for improving your Spanish?',
    options: [
      'Work',
      'Living abroad',
      'Traveling',
      'Developing my skills',
      'Speaking with friends',
      'Studying',
    ],
    icons: ['💼', '🌍', '✈️', '🚀', '💛', '🎓'],
  },
  // 7. Fréquence de parole
  {
    id: '7',
    step: 'speaking_frequency',
    type: 'speaking_frequency',
    question: 'How often do you speak Spanish in your daily life?',
    options: [
      'Every day',
      'A few days a week',
      'A few days a month',
      'Never',
    ],
    icons: ['🚀', '🏃', '🚶', '💀'],
  },
  // 8. Peur d'être ridicule
  {
    id: '8',
    step: 'fear_ridiculous',
    type: 'fear_ridiculous',
    question: 'Are you afraid of sounding silly when you speak Spanish?',
    options: ['No', 'Maybe', 'Yes'],
    icons: ['❌', '🤷‍♂️', '✅'],
  },
  // 9. Où veux-tu t'améliorer ?
  {
    id: '9',
    step: 'improvement_areas',
    type: 'improvement_areas',
    question: 'Where do you want to improve?',
    options: [
      'Speaking with confidence',
      'Improving pronunciation',
      'Enriching vocabulary',
      'Being good at grammar',
      'Understanding native speakers',
      'Writing more fluently',
      'Something else',
    ],
    icons: ['💬', '👄', '💪', '✍️', '👂', '📝', '🎯'],
  },
  // 10. Sujets d'intérêt
  {
    id: '10',
    step: 'interests',
    type: 'interests',
    question: 'What topics interest you?',
    subtitle: 'We\'ll make your Spanish practice more fun',
    options: [
      'Memes',
      'Humor',
      'Tech',
      'Business',
      'Video games',
      'Music',
      'Movies',
      'News',
      'Books',
      'Podcasts',
      'Fitness',
      'Food',
      'Crafts',
      'Travel',
      'Science',
    ],
    icons: ['👀', '😂', '🚀', '💼', '🎮', '🎵', '🎬', '📰', '📚', '🎙️', '🏃', '🍕', '🧶', '✈️', '🧠'],
    multiSelect: true,
  },
  // 11. Engagement (série de jours)
  {
    id: '11',
    step: 'commitment',
    type: 'commitment',
    question: 'What is your commitment to progress?',
    options: [
      '7-day streak',
      '14-day streak',
      '30-day streak',
      '50-day streak',
    ],
    labels: ['Promising', 'Determined', 'Impressive', 'Unstoppable'],
    icons: ['✈️', '🚁', '🛸', '🚀'],
    mostChosen: '30-day streak',
  },
  // 12. Engagement de motivation
  {
    id: '12',
    step: 'motivation_commitment',
    type: 'motivation_commitment',
    title: 'Motivation commitment',
    message: 'To achieve what I want, I must progress.\n\nI therefore commit to reaching my goals and improving myself.\n\nAnd I trust Sofia to guide me along the way and help me speak Spanish fluently.',
    icon: '🤝',
  },
  // 13. Message du futur
  {
    id: '13',
    step: 'future_message',
    type: 'future_message',
    title: 'It\'s me',
    sender: 'Future you',
    date: 'November 15, 2025',
    message: 'Yes, it\'s you from the future. I\'m writing to you from 2025 because today is an important day for you. For us!\n\nNovember 15, 2025 is the day we changed our lives.\n\nToday I feel great and I speak Spanish fluently. Thanks to the personal development decision you are about to make.\n\nSee you soon,\nFuture you',
  },
  // 14. Plan personnalisé
  {
    id: '14',
    step: 'personalized_plan',
    type: 'personalized_plan',
    title: 'I\'m creating your personalized study plan',
    subtitle: 'Adapted to your level and needs',
    message: 'Using materials related to your interests improves vocabulary learning by 30%.',
    researchLogos: ['Routledge Taylor & Francis Group', 'HIDI & RENNINGER'],
    sofiaMessage: 'Each lesson is built from what you discuss with me.',
  },
  // 15. Comparaison (Ils te font cliquer, Emma te fait parler)
  {
    id: '15',
    step: 'comparison',
    type: 'comparison',
    title: 'They make you click, Sofia makes you speak',
    highlightWord: 'speak',
  },
  // 16. Notifications
  {
    id: '16',
    step: 'notifications',
    type: 'notifications',
    question: 'With me, you won\'t forget to practice',
  },
  // 17. Paywall
  {
    id: '17',
    step: 'paywall',
    type: 'paywall',
    title: 'Sam, access Sofia',
    trialText: '7 days free, then $99.99 ($8.33/month)',
    subscriptionTypes: ['Annual', 'Quarterly'],
    timeline: [
      {
        label: 'Today',
        icon: '🔒',
        text: 'Unlock unlimited practice with Sofia, all lessons, and more.',
      },
      {
        label: 'In 5 days',
        icon: '🔔',
        text: 'We\'ll send you a reminder that your trial is ending soon.',
      },
      {
        label: 'In 7 days',
        icon: '⭐',
        text: 'You\'ll be charged, cancel anytime before.',
      },
    ],
    paymentAssurance: 'NO PAYMENT DUE NOW',
  },
  // 18. Première session
  {
    id: '18',
    step: 'first_session',
    type: 'message',
    sofiaMessage: 'Amazing—your training officially begins 🎉 I\'ll now ask you real questions, and you\'ll answer in Spanish. Ready for your first mini-conversation?',
  },
];

interface UseOnboardingReturn {
  currentStep: number;
  totalSteps: number;
  currentQuestion: OnboardingQuestion;
  answers: Record<string, string | string[]>;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  goToStepByType: (stepType: string) => void;
  setAnswer: (questionId: string, answer: string | string[]) => void;
  setUserSpoke: (questionId: string, spoke: boolean) => void;
  setSttResult: (questionId: string, result: string) => void;
  isComplete: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [userSpoke, setUserSpokeState] = useState<Record<string, boolean>>({});
  const [sttResults, setSttResults] = useState<Record<string, string>>({});

  const currentQuestion = onboardingQuestions[currentStep];
  const totalSteps = onboardingQuestions.length;
  const isComplete = currentStep >= totalSteps - 1;

  // Enrichir la question actuelle avec les données utilisateur
  const enrichedQuestion: OnboardingQuestion = {
    ...currentQuestion,
    userSpoke: userSpoke[currentQuestion.id] || false,
    sttResult: sttResults[currentQuestion.id] || '',
  };

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const goToStepByType = useCallback((stepType: string) => {
    const stepIndex = onboardingQuestions.findIndex(q => q.step === stepType);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, []);

  const setAnswer = useCallback((questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const setUserSpoke = useCallback((questionId: string, spoke: boolean) => {
    setUserSpokeState((prev) => ({ ...prev, [questionId]: spoke }));
  }, []);

  const setSttResult = useCallback((questionId: string, result: string) => {
    setSttResults((prev) => ({ ...prev, [questionId]: result }));
  }, []);

  return {
    currentStep,
    totalSteps,
    currentQuestion: enrichedQuestion,
    answers,
    nextStep,
    previousStep,
    goToStep,
    goToStepByType,
    setAnswer,
    setUserSpoke,
    setSttResult,
    isComplete,
  };
}
