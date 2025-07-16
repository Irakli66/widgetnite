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
