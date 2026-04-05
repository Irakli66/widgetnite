"use client";

import { BonusHuntSlotFormatted } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, Trophy } from "lucide-react";

interface HuntStatsProps {
  startBalance: number;
  slots: BonusHuntSlotFormatted[];
}

export default function HuntStats({ startBalance, slots }: HuntStatsProps) {
  const openedSlots = slots.filter(s => s.payout !== null);
  const unopenedSlots = slots.filter(s => s.payout === null);

  const huntCost = startBalance;
  const huntPaid = openedSlots.reduce((sum, s) => sum + (s.payout || 0), 0);

  const runningAvgX = openedSlots.length > 0
    ? openedSlots.reduce((sum, s) => sum + (s.payout || 0) / s.betSize, 0) / openedSlots.length
    : 0;

  const remainingBetTotal = unopenedSlots.reduce((sum, s) => sum + s.betSize, 0);
  const requiredAvgX = remainingBetTotal > 0
    ? (startBalance - huntPaid) / remainingBetTotal
    : 0;

  const bestWinDollar = openedSlots.length > 0
    ? Math.max(...openedSlots.map(s => s.payout || 0))
    : 0;

  const bestWinMulti = openedSlots.length > 0
    ? Math.max(...openedSlots.map(s => (s.payout || 0) / s.betSize))
    : 0;

  const bestWinDollarSlot = openedSlots.find(s => s.payout === bestWinDollar);
  const bestWinMultiSlot = openedSlots.find(s => (s.payout || 0) / s.betSize === bestWinMulti);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hunt Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${huntCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Starting balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hunt Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${huntPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {openedSlots.length} of {slots.length} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Avg X</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningAvgX.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Avg X</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unopenedSlots.length > 0 ? `${requiredAvgX.toFixed(2)}x` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">To break even</p>
          </CardContent>
        </Card>
      </div>

      {openedSlots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Best Win (Dollar)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                ${bestWinDollar.toFixed(2)}
              </div>
              {bestWinDollarSlot && (
                <p className="text-xs text-muted-foreground mt-1">
                  {bestWinDollarSlot.slotName} - {((bestWinDollarSlot.payout || 0) / bestWinDollarSlot.betSize).toFixed(2)}x
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Best Win (Multi)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">
                {bestWinMulti.toFixed(2)}x
              </div>
              {bestWinMultiSlot && (
                <p className="text-xs text-muted-foreground mt-1">
                  {bestWinMultiSlot.slotName} - ${(bestWinMultiSlot.payout || 0).toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
