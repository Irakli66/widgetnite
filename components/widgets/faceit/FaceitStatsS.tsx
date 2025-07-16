"use client";

import { motion } from "framer-motion";
import { useRequest } from "@/hooks/useRequest";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  Zap,
  TrendingUp,
  Skull,
  TrendingDown,
  Flame,
} from "lucide-react";

import {
  FaceitPlayerData,
  FaceitStatsData,
  Last30MatchesData,
} from "@/lib/types/faceit";

import {
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,
  Level7,
  Level8,
  Level9,
  Level10,
} from "./Levels";

const levelSvgs = {
  1: <Level1 />,
  2: <Level2 />,
  3: <Level3 />,
  4: <Level4 />,
  5: <Level5 />,
  6: <Level6 />,
  7: <Level7 />,
  8: <Level8 />,
  9: <Level9 />,
  10: <Level10 />,
};

export const eloRanges = [
  { level: 1, min: 100, max: 500 },
  { level: 2, min: 501, max: 750 },
  { level: 3, min: 751, max: 900 },
  { level: 4, min: 901, max: 1050 },
  { level: 5, min: 1051, max: 1200 },
  { level: 6, min: 1201, max: 1350 },
  { level: 7, min: 1351, max: 1530 },
  { level: 8, min: 1531, max: 1750 },
  { level: 9, min: 1751, max: 2000 },
  { level: 10, min: 2001, max: Infinity },
];

export default function FaceitStats() {
  const {
    data: playerData,
    error: playerError,
    isLoading: playerLoading,
  } = useRequest<FaceitPlayerData>("/api/faceit", {
    refreshInterval: 60_000,
    revalidateIfStale: true,
    revalidateOnFocus: false,
  });

  const shouldFetchStats = Boolean(playerData?.player_id);

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useRequest<FaceitStatsData>(shouldFetchStats ? `/api/faceit/stats` : "", {
    refreshInterval: 30_000,
    revalidateIfStale: true,
    revalidateOnFocus: false,
  });

  const {
    data: matchData,
    error: matchError,
    isLoading: matchLoading,
  } = useRequest<Last30MatchesData>(
    shouldFetchStats ? `/api/faceit/matches` : "",
    {
      refreshInterval: 30_000,
      revalidateIfStale: true,
      revalidateOnFocus: false,
    }
  );

  const csData = playerData?.games.cs2 || playerData?.games.csgo;
  const isInitialLoading = playerLoading;
  const hasError = playerError || statsError || matchError;

  if (isInitialLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-center h-20">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-300 font-medium">
              Loading FACEIT stats...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !playerData) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-red-900/20 via-blue-900/95 to-slate-900/95 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center justify-center h-20">
          <span className="text-red-400 font-medium">
            Failed to load FACEIT data
          </span>
        </div>
      </div>
    );
  }

  if (matchLoading || statsLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-center h-20">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-300 font-medium">
              Loading FACEIT stats...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full relative max-w-xl mx-auto bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden"
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 pb-3">
          {/* Avatar & Name */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/25">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  {playerData.avatar ? (
                    <Image
                      src={playerData.avatar}
                      alt={playerData.nickname}
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-blue-400 font-bold text-lg">
                      {playerData.nickname.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {playerData.nickname}
              </h2>
              <div className="text-center flex items-center gap-2">
                <div className="text-lg font-bold text-blue-400">
                  {csData?.faceit_elo}
                </div>
                <div className="text-xs text-blue-300">ELO</div>
              </div>
            </div>
          </div>

          {/* Skill Level */}
          <div className="flex flex-col items-end">
            {csData && (
              <div className="flex items-center space-x-2">
                <div className="flex gap-1">
                  {statsData?.lifetime["Recent Results"].map(
                    (result, index) => (
                      <div
                        key={index}
                        className={`flex text-white rounded-xs w-6 h-6 items-center justify-center ${
                          result === "1" ? " bg-green-600" : "bg-red-500"
                        }`}
                      >
                        {result === "1" ? "W" : "L"}
                      </div>
                    )
                  )}
                </div>
                <div className="relative w-10 h-10">
                  {levelSvgs[csData.skill_level as keyof typeof levelSvgs]}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-blue-500/20" />

        {/* Stats Section */}
        <div className="p-4 pt-3">
          <h2 className="text-white text-md font-semibold">Last 30 Matches</h2>
          <div className="flex">
            {statsData && (
              <div className="flex justify-between w-full">
                <div className="bg-black/40 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4 text-sky-400" />
                    <span className="text-blue-300 text-sm">K/D Ratio</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {matchData?.kd || statsData.lifetime["Average K/D Ratio"]}
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span className="text-blue-300 text-sm">Headshots</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {matchData?.hsPercent ||
                      statsData.lifetime["Average Headshots %"]}
                    %
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    {matchData && Number(matchData.winRate) > 50 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}

                    <span className="text-blue-300 text-sm">Win Rate</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {matchData?.winRate || statsData.lifetime["Win Rate %"]}%
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    {Number(statsData.lifetime["Current Win Streak"]) > 3 ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [-2, 2, -2, 2, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Flame className="w-4 h-4 text-orange-400" />
                      </motion.div>
                    ) : (
                      <Zap className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-blue-300 text-sm">Win Streak</span>
                  </div>
                  <motion.div
                    className="text-xl font-bold text-white"
                    animate={
                      Number(statsData.lifetime["Current Win Streak"]) > 3
                        ? {
                            textShadow: [
                              "0 0 5px rgba(249, 115, 22, 0.5)",
                              "0 0 10px rgba(249, 115, 22, 0.8)",
                              "0 0 5px rgba(249, 115, 22, 0.5)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {statsData.lifetime["Current Win Streak"]}
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
