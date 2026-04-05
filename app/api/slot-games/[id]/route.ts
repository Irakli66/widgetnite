import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { SlotGameStats } from "@/lib/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the slot game
    const slotGame = await db
      .selectFrom("slot_games")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!slotGame) {
      return NextResponse.json(
        { error: "Slot game not found" },
        { status: 404 }
      );
    }

    // Get all slots linked to this game
    const gameSlots = await db
      .selectFrom("bonus_hunt_slots")
      .selectAll()
      .where("slot_game_id", "=", id)
      .execute();

    const openedSlots = gameSlots.filter((s) => s.payout !== null);

    const totalBonuses = gameSlots.length;
    const openedBonuses = openedSlots.length;
    const totalInvested = gameSlots.reduce(
      (sum, s) => sum + Number(s.bet_size),
      0
    );
    const totalWon = openedSlots.reduce((sum, s) => sum + Number(s.payout), 0);

    const bestPayout =
      openedSlots.length > 0
        ? Math.max(...openedSlots.map((s) => Number(s.payout)))
        : 0;

    const bestMultiplier =
      openedSlots.length > 0
        ? Math.max(
            ...openedSlots.map(
              (s) => Number(s.payout) / Number(s.bet_size)
            )
          )
        : 0;

    const avgMultiplier =
      openedSlots.length > 0
        ? openedSlots.reduce(
            (sum, s) => sum + Number(s.payout) / Number(s.bet_size),
            0
          ) / openedSlots.length
        : 0;

    const lastPlayedSlot = gameSlots.sort(
      (a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
    )[0];

    const stats: SlotGameStats = {
      id: slotGame.id!,
      userId: slotGame.user_id,
      name: slotGame.name,
      normalizedName: slotGame.normalized_name,
      timesPlayed: slotGame.times_played || 0,
      createdAt: slotGame.created_at!,
      updatedAt: slotGame.updated_at!,
      totalBonuses,
      openedBonuses,
      bestMultiplier,
      bestPayout,
      avgMultiplier,
      totalInvested,
      totalWon,
      netProfit: totalWon - totalInvested,
      lastPlayed: lastPlayedSlot ? lastPlayedSlot.created_at! : null,
    };

    return NextResponse.json({ slotGame: stats });
  } catch (error) {
    console.error("Error fetching slot game details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
