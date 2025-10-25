"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { ClashRoyaleChallengeFormatted } from "@/lib/models";

function ClashRoyaleWidgetContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id");

  const [challenge, setChallenge] =
    useState<ClashRoyaleChallengeFormatted | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setError("No challenge ID provided");
      setLoading(false);
      return;
    }

    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/clash-royale/${challengeId}`);
        const data = await response.json();

        if (response.ok) {
          setChallenge(data.challenge);
        } else {
          setError(data.error || "Failed to load challenge");
        }
      } catch {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchChallenge, 10000);

    return () => clearInterval(interval);
  }, [challengeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-200 text-xl"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-xl text-center p-8"
        >
          {error || "Challenge not found"}
        </motion.div>
      </div>
    );
  }

  const isAttemptOver = challenge.currentLosses >= challenge.maxLosses;
  const progressPercent = (challenge.currentWins / challenge.winGoal) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-zinc-950/95 via-black/95 to-zinc-950/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-900/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-amber-900/30 p-6">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 flex items-center gap-3"
            >
              <Trophy className="h-8 w-8 text-amber-400" />
              {challenge.name}
            </motion.h1>
            <p className="text-zinc-400 mt-2">
              მიზანი: {challenge.winGoal} wins • Max: {challenge.maxLosses}{" "}
              წაგება
            </p>
          </div>

          {/* Current Stats */}
          <div className="p-6 space-y-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">მიმდინარე პროგრესი</span>
                <motion.div
                  key={`${challenge.currentWins}-${challenge.currentLosses}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex items-end gap-2"
                >
                  {/* Wins */}
                  <div className="text-center">
                    <div className="text-xs text-amber-400 font-semibold mb-1">
                      W
                    </div>
                    <span
                      className={`text-4xl font-bold ${
                        isAttemptOver
                          ? "text-red-400"
                          : "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200"
                      }`}
                    >
                      {challenge.currentWins}
                    </span>
                  </div>

                  {/* Separator */}
                  <span
                    className={`text-3xl font-bold pb-1 ${
                      isAttemptOver ? "text-red-400" : "text-zinc-600"
                    }`}
                  >
                    -
                  </span>

                  {/* Losses */}
                  <div className="text-center">
                    <div className="text-xs text-zinc-400 font-semibold mb-1">
                      L
                    </div>
                    <span
                      className={`text-4xl font-bold ${
                        isAttemptOver
                          ? "text-red-400"
                          : "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200"
                      }`}
                    >
                      {challenge.currentLosses}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-zinc-800 rounded-full h-4 overflow-hidden border border-zinc-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    isAttemptOver
                      ? "bg-gradient-to-r from-red-600 to-red-700"
                      : "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"
                  }`}
                />
              </div>

              {/* Status Message */}
              {isAttemptOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-red-400 font-semibold text-lg mt-2"
                >
                  Attempt Ended
                </motion.div>
              )}
            </motion.div>

            {/* Statistics Grid */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Best Run */}
              <div className="bg-zinc-900/80 rounded-lg p-4 border border-amber-900/40">
                <div className="flex items-center gap-2 text-white text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  საუკეთესო შედეგი
                </div>
                {challenge.bestWins > 0 ? (
                  <div className="flex items-end gap-1.5 ">
                    {/* Wins */}
                    <div className="text-center">
                      <div className="text-[10px] text-amber-400 font-semibold mb-0.5">
                        W
                      </div>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300">
                        {challenge.bestWins}
                      </span>
                    </div>

                    {/* Separator */}
                    <span className="text-xl font-bold pb-0.5 text-zinc-600">
                      -
                    </span>

                    {/* Losses */}
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-400 font-semibold mb-0.5">
                        L
                      </div>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300">
                        {challenge.bestLosses}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-zinc-500 text-center">
                    N/A
                  </div>
                )}
              </div>

              {/* Total Attempts */}
              <div className="bg-zinc-900/80 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 text-white text-sm mb-2">
                  <Target className="w-4 h-4" />
                  მცდელობები
                </div>
                <div className="flex items-center justify-start h-[42px]">
                  <div className="text-2xl font-bold text-zinc-300">
                    {challenge.totalAttempts}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Win/Loss Indicators */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClashRoyaleWidget() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-200 text-xl"
          >
            Loading...
          </motion.div>
        </div>
      }
    >
      <ClashRoyaleWidgetContent />
    </Suspense>
  );
}
