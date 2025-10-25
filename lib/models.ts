export interface User {
  id: string | null;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
  faceit: string | null;
  faceitId: string | null;
  twitch: string | null;
  kick: string | null;
}

export interface Widget {
  id: string;
  user_id: string;
  type: 'faceit-stats';
  name: string;
  compact: boolean;
  color_theme: 'blue' | 'violet' | 'green' | 'red';
  show_profile: boolean;
  widget_url: string;
  faceit_username?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetFormatted {
  id: string;
  userId: string;
  type: 'faceit-stats';
  name: string;
  compact: boolean;
  colorTheme: 'blue' | 'violet' | 'green' | 'red';
  showProfile: boolean;
  widgetUrl: string;
  faceitUsername?: string;
  created_at: string;
  updated_at: string;
}

export interface ClashRoyaleChallenge {
  id?: string;
  user_id: string;
  name: string;
  win_goal: number;
  max_losses: number;
  current_wins?: number;
  current_losses?: number;
  best_wins?: number;
  best_losses?: number;
  total_attempts?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClashRoyaleChallengeFormatted {
  id: string;
  userId: string;
  name: string;
  winGoal: number;
  maxLosses: number;
  currentWins: number;
  currentLosses: number;
  bestWins: number;
  bestLosses: number;
  totalAttempts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}