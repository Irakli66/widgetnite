"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BonusHuntWithSlots } from "@/lib/models";

type HuntWithLifecycle = BonusHuntWithSlots & {
  huntNumber?: number;
  status?: "not_started" | "in_progress" | "ended";
  currentSlotIndex?: number | null;
  huntResult?: "profit" | "no_profit" | null;
};

interface BonusHuntWidgetProps {
  huntId: string;
}

export default function BonusHuntWidget({ huntId }: BonusHuntWidgetProps) {
  const [hunt, setHunt] = useState<HuntWithLifecycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      eventSource = new EventSource(`/api/bonus-hunt/${huntId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const huntData = JSON.parse(event.data);
          setHunt(huntData);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource?.close();
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      eventSource?.close();
    };
  }, [huntId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="text-xl text-white">Hunt not found</div>
      </div>
    );
  }

  const openedSlots = hunt.slots.filter((s) => s.payout !== null);
  const unopenedSlots = hunt.slots.filter((s) => s.payout === null);

  const huntCost = hunt.startBalance;
  const huntPaid = openedSlots.reduce((sum, s) => sum + (s.payout || 0), 0);
  const totalBonuses = hunt.slots.length;
  const remainingBonuses = unopenedSlots.length;

  const runningAvgX =
    openedSlots.length > 0
      ? openedSlots.reduce((sum, s) => sum + (s.payout || 0) / s.betSize, 0) /
        openedSlots.length
      : 0;

  const bestWinDollar =
    openedSlots.length > 0
      ? Math.max(...openedSlots.map((s) => s.payout || 0))
      : 0;

  const bestWinMulti =
    openedSlots.length > 0
      ? Math.max(...openedSlots.map((s) => (s.payout || 0) / s.betSize))
      : 0;

  const requiredAvgX =
    huntPaid >= huntCost
      ? "0.00x"
      : remainingBonuses > 0
        ? `${((huntCost - huntPaid) / unopenedSlots.reduce((sum, s) => sum + s.betSize, 0)).toFixed(2)}x`
        : "N/A";

  // Enable scrolling if status is "not_started" OR "ended" AND there are more than 3 slots
  const shouldScroll = (hunt?.status === "not_started" || hunt?.status === "ended") && hunt.slots.length > 3;
  const isInProgress = hunt?.status === "in_progress";

  // Calculate animation duration based on number of slots (3 seconds per slot)
  const animationDuration = hunt?.slots ? hunt.slots.length * 3 : 20;

  // Calculate visible slots window when hunt is in progress
  const getVisibleSlots = () => {
    if (!hunt || !isInProgress || hunt.slots.length <= 3) {
      return hunt?.slots || [];
    }

    const currentIndex = hunt.currentSlotIndex ?? 0;
    const totalSlots = hunt.slots.length;

    // Calculate the start of the 3-slot window
    let startIndex = Math.max(0, currentIndex - 1);
    
    // Adjust if we're near the end
    if (startIndex + 3 > totalSlots) {
      startIndex = totalSlots - 3;
    }

    return hunt.slots.slice(startIndex, startIndex + 3);
  };

  const visibleSlots = isInProgress ? getVisibleSlots() : hunt?.slots || [];

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-start justify-center">
      <div className="w-full max-w-[1200px] bg-black text-white rounded-xl overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h1 className="text-2xl font-semibold lowercase">bonus hunt</h1>
          <div className="text-xl font-semibold text-[#FFBF00]">
            #{hunt.huntNumber || 1}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 px-6 py-4 bg-white/[0.03] border-b border-white/10">
          {/* Left Column */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Start:</span>
              <span className="text-lg font-bold">
                $
                {huntCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Total Bonuses:</span>
              <span className="text-lg font-bold">{totalBonuses}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Run Average:</span>
              <span className="text-lg font-bold">
                {runningAvgX.toFixed(2)}x
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Winnings:</span>
              <span className="text-lg font-bold text-[#FFBF00]">
                $
                {huntPaid.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Remaining Bonuses:</span>
              <span className="text-lg font-bold">{remainingBonuses}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Req. Average:</span>
              <span className="text-lg font-bold text-[#FFBF00]">
                {requiredAvgX}
              </span>
            </div>
          </div>
        </div>

        {/* Best Wins Row */}
        {openedSlots.length > 0 && (
          <div className="flex gap-4 px-6 py-3 bg-[#FFBF00]/[0.05] border-b border-white/10">
            <div className="flex-1">
              <span className="text-sm text-white/60">Biggest WIN:</span>
              <span className="text-lg font-bold text-[#FFBF00] ml-3">
                $
                {bestWinDollar.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div>
              <span className="text-sm text-white/60">Lucky WIN:</span>
              <span className="text-lg font-bold text-[#FFBF00] ml-3">
                {bestWinMulti.toFixed(2)}x
              </span>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_180px_180px] px-6 py-3 bg-white/[0.05] text-xs font-semibold text-white/50 uppercase">
          <div>#</div>
          <div>Game</div>
          <div className="text-right">Bet Size</div>
          <div className="text-right">Payout</div>
        </div>

        {/* Table Rows */}
        <div className={`bg-black relative ${shouldScroll || (isInProgress && hunt.slots.length > 3) ? "h-[150px] overflow-hidden" : ""}`}>
          {hunt.slots.length === 0 ? (
            <div className="py-8 text-center text-white/30">
              No slots added yet
            </div>
          ) : (
            <motion.div
              className={shouldScroll ? "absolute top-0 left-0 right-0" : ""}
              animate={shouldScroll ? {
                y: [0, "-50%"]
              } : {}}
              transition={{
                duration: animationDuration,
                repeat: shouldScroll ? Infinity : 0,
                ease: "linear"
              }}
            >
              {/* Render slots based on status */}
              {visibleSlots.map((slot, visibleIndex) => {
                // Get the actual index in the full slots array
                const index = hunt.slots.findIndex(s => s.id === slot.id);
                const isOpened = slot.payout !== null;
                const isCurrentSlot =
                  isInProgress && hunt.currentSlotIndex === index;

                return (
                  <div
                    key={slot.id}
                    className={`grid grid-cols-[60px_1fr_180px_180px] px-6 py-3 transition-all duration-300 ${
                      visibleIndex < visibleSlots.length - 1
                        ? "border-b border-white/5"
                        : ""
                    } ${
                      isCurrentSlot 
                        ? "bg-[#FFBF00]/[0.08] border-l-2 border-[#FFBF00]/60" 
                        : ""
                    }`}
                  >
                    <div
                      className={`text-base font-semibold ${
                        isCurrentSlot
                          ? "text-[#FFBF00]"
                          : isOpened
                            ? "text-[#FFBF00]"
                            : "text-white/30"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div
                      className={`text-base font-medium ${
                        isCurrentSlot
                          ? "text-white font-bold"
                          : isOpened
                            ? "text-white"
                            : "text-white/40"
                      }`}
                    >
                      {slot.slotName}
                    </div>

                    <div
                      className={`text-base font-medium text-right ${
                        isCurrentSlot
                          ? "text-white"
                          : isOpened
                            ? "text-white"
                            : "text-white/40"
                      }`}
                    >
                      $
                      {slot.betSize.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    <div
                      className={`text-base font-bold text-right ${isOpened ? "text-[#FFBF00]" : "text-white/20"}`}
                    >
                      {isOpened
                        ? `$${slot.payout!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "—"}
                    </div>
                  </div>
                );
              })}
              {/* Duplicate slots for seamless loop when scrolling (only for not_started) */}
              {shouldScroll && !isInProgress &&
                hunt.slots.map((slot, index) => {
                  const isOpened = slot.payout !== null;

                  return (
                    <div
                      key={`duplicate-${slot.id}`}
                      className={`grid grid-cols-[60px_1fr_180px_180px] px-6 py-3 transition-colors ${
                        index < hunt.slots.length - 1
                          ? "border-b border-white/5"
                          : ""
                      }`}
                    >
                      <div
                        className={`text-base font-semibold ${isOpened ? "text-[#FFBF00]" : "text-white/30"}`}
                      >
                        #{index + 1}
                      </div>

                      <div
                        className={`text-base font-medium ${isOpened ? "text-white" : "text-white/40"}`}
                      >
                        {slot.slotName}
                      </div>

                      <div
                        className={`text-base font-medium text-right ${isOpened ? "text-white" : "text-white/40"}`}
                      >
                        $
                        {slot.betSize.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>

                      <div
                        className={`text-base font-bold text-right ${isOpened ? "text-[#FFBF00]" : "text-white/20"}`}
                      >
                        {isOpened
                          ? `$${slot.payout!.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"}
                      </div>
                    </div>
                  );
                })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
