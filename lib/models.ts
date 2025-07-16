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
