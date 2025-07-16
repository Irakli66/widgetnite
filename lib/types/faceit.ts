export type FaceitPlayerData = {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  cover_image: string;
  games: {
    cs2?: {
      skill_level: number;
      faceit_elo: number;
      region: string;
    };
    csgo?: {
      skill_level: number;
      faceit_elo: number;
      region: string;
    };
  };
};

export type FaceitStatsData = {
  lifetime: {
    "Average K/D Ratio": string;
    "Recent Results": string[];
    "Average Headshots %": string;
    Matches: string;
    "Win Rate %": string;
    "Total Headshots %": string;
    Wins: string;
    "Current Win Streak": string;
  };
};

export type Last30MatchesData = {
  avAssists: string;
  avDeaths: string;
  avKills: string;
  deaths: number;
  elo: number | null;
  hsPercent: string;
  kd: string;
  kills: number;
  loses: number;
  matchCount: number;
  winRate: string;
  wins: number;
  lastGameStas: {
    ADR: string;
    Assists: string;
    "Best Of": string;
    "Competition Id": string;
    "Created At": string;
    Deaths: string;
    "Double Kills": string;
    "Final Score": string;
    "First Half Score": string;
    Game: string;
    "Game Mode": string;
    Headshots: string;
    "Headshots %": string;
    "K/D Ratio": string;
    "K/R Ratio": string;
    Kills: string;
    MVPs: string;
    Map: string;
    "Match Finished At": number;
    "Match Id": string;
    "Match Round": string;
    Nickname: string;
    "Overtime score": string;
    "Penta Kills": string;
    "Player Id": string;
    "Quadro Kills": string;
    Region: string;
    Result: string;
    Rounds: string;
    Score: string;
    "Second Half Score": string;
    Team: string;
    "Triple Kills": string;
    "Updated At": string;
    Winner: string;
  };
};
