export interface User {
  id: string;
  name: string;
  email?: string;
  streak: number;
  trophies: number;
  gems: number;
  level: number;
  keys: number;
}

export interface TimelineItem {
  label: string;
  icon: string;
  text: string;
}

export interface OnboardingQuestion {
  id: string;
  step: 
    | 'intro_video'
    | 'spanish_level'
    | 'native_language' 
    | 'name' 
    | 'slideshow'
    | 'gender' 
    | 'age' 
    | 'current_learning' 
    | 'main_goal' 
    | 'speaking_frequency' 
    | 'fear_ridiculous' 
    | 'improvement_areas' 
    | 'interests' 
    | 'commitment' 
    | 'motivation_commitment' 
    | 'future_message' 
    | 'personalized_plan' 
    | 'comparison' 
    | 'notifications' 
    | 'paywall' 
    | 'first_session';
  type: 
    | 'intro_video'
    | 'spanish_level'
    | 'native_language' 
    | 'text' 
    | 'slideshow'
    | 'gender' 
    | 'age' 
    | 'current_learning' 
    | 'main_goal' 
    | 'speaking_frequency' 
    | 'fear_ridiculous' 
    | 'improvement_areas' 
    | 'interests' 
    | 'commitment' 
    | 'motivation_commitment' 
    | 'future_message' 
    | 'personalized_plan' 
    | 'comparison' 
    | 'notifications' 
    | 'paywall' 
    | 'message' 
    | 'voice';
  sofiaMessage?: string;
  question?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  sender?: string;
  date?: string;
  imageUrl?: string;
  videoUrl?: string;
  options?: string[];
  flags?: string[];
  icons?: string[];
  icon?: string;
  labels?: string[];
  placeholder?: string;
  expectedAnswer?: string | string[];
  userSpoke?: boolean;
  sttResult?: string;
  multiSelect?: boolean;
  mostChosen?: string;
  researchLogos?: string[];
  highlightWord?: string;
  subscriptionTypes?: string[];
  timeline?: TimelineItem[];
  paymentAssurance?: string;
  trialText?: string;
  slides?: any[];
  highlightText?: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: number;
  imageUrl?: string;
  prompt: string;
  correctAnswer: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: {
    type: 'gem' | 'key' | 'trophy';
    amount: number;
  };
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  translation?: string;
  explanation?: string;
}
