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

export interface BonusHunt {
  id?: string;
  user_id: string;
  name: string;
  start_balance: number;
  status?: 'not_started' | 'in_progress' | 'ended';
  current_slot_index?: number | null;
  hunt_result?: 'profit' | 'no_profit' | null;
  created_at?: string;
  updated_at?: string;
}

export interface BonusHuntFormatted {
  id: string;
  userId: string;
  name: string;
  startBalance: number;
  status?: 'not_started' | 'in_progress' | 'ended';
  currentSlotIndex?: number | null;
  huntResult?: 'profit' | 'no_profit' | null;
  createdAt: string;
  updatedAt: string;
}

export interface BonusHuntSlot {
  id?: string;
  hunt_id: string;
  slot_name: string;
  bet_size: number;
  payout: number | null;
  position: number;
  slot_game_id?: string | null;
  is_super?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BonusHuntSlotFormatted {
  id: string;
  huntId: string;
  slotName: string;
  betSize: number;
  payout: number | null;
  position: number;
  slotGameId?: string | null;
  isSuper?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BonusHuntWithSlots extends BonusHuntFormatted {
  slots: BonusHuntSlotFormatted[];
}

export interface SlotGame {
  id?: string;
  user_id: string;
  name: string;
  normalized_name: string;
  times_played?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SlotGameFormatted {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  timesPlayed: number;
  createdAt: string;
  updatedAt: string;
}

export interface SlotGameStats extends SlotGameFormatted {
  totalBonuses: number;
  openedBonuses: number;
  bestMultiplier: number;
  bestPayout: number;
  avgMultiplier: number;
  totalInvested: number;
  totalWon: number;
  netProfit: number;
  lastPlayed: string | null;
}