import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all hunts with their slots
    const hunts = await db
      .selectFrom("bonus_hunts")
      .selectAll()
      .where("user_id", "=", user.id)
      .execute();

    // Get all slots for these hunts
    const allSlots = await db
      .selectFrom("bonus_hunt_slots")
      .selectAll()
      .where(
        "hunt_id",
        "in",
        hunts.map((h) => h.id!)
      )
      .execute();

    // Calculate statistics
    const totalHunts = hunts.length;
    const totalCost = hunts.reduce(
      (sum, h) => sum + Number(h.start_balance),
      0
    );

    const totalWinnings = allSlots.reduce(
      (sum, s) => sum + (s.payout ? Number(s.payout) : 0),
      0
    );

    const netProfit = totalWinnings - totalCost;
    const profitPercentage =
      totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

    const completedHunts = hunts.filter((h) => h.status === "ended");
    const profitHunts = completedHunts.filter(
      (h) => h.hunt_result === "profit"
    );
    const noProfitHunts = completedHunts.filter(
      (h) => h.hunt_result === "no_profit"
    );

    const totalBonuses = allSlots.length;
    const openedBonuses = allSlots.filter((s) => s.payout !== null).length;

    // Calculate average multiplier for opened bonuses
    const openedSlotsWithPayout = allSlots.filter((s) => s.payout !== null);
    const avgMultiplier =
      openedSlotsWithPayout.length > 0
        ? openedSlotsWithPayout.reduce(
            (sum, s) => sum + (s.payout ? Number(s.payout) : 0) / Number(s.bet_size),
            0
          ) / openedSlotsWithPayout.length
        : 0;

    // Best single win (amount)
    const bestWin =
      openedSlotsWithPayout.length > 0
        ? Math.max(...openedSlotsWithPayout.map((s) => Number(s.payout)))
        : 0;

    // Best multiplier
    const bestMultiplier =
      openedSlotsWithPayout.length > 0
        ? Math.max(
            ...openedSlotsWithPayout.map(
              (s) => Number(s.payout) / Number(s.bet_size)
            )
          )
        : 0;

    const stats = {
      totalHunts,
      completedHunts: completedHunts.length,
      inProgressHunts: hunts.filter((h) => h.status === "in_progress").length,
      notStartedHunts: hunts.filter((h) => h.status === "not_started").length,
      totalCost,
      totalWinnings,
      netProfit,
      profitPercentage,
      profitHunts: profitHunts.length,
      noProfitHunts: noProfitHunts.length,
      profitRate:
        completedHunts.length > 0
          ? (profitHunts.length / completedHunts.length) * 100
          : 0,
      totalBonuses,
      openedBonuses,
      unopenedBonuses: totalBonuses - openedBonuses,
      avgMultiplier,
      bestWin,
      bestMultiplier,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching bonus hunt stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
