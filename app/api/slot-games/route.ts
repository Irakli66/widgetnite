import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { SlotGameStats } from "@/lib/models";

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

    // Get all slot games for user
    const slotGames = await db
      .selectFrom("slot_games")
      .selectAll()
      .where("user_id", "=", user.id)
      .orderBy("name", "asc")
      .execute();

    // Get all slots linked to these games
    const slotGameIds = slotGames.map((sg) => sg.id!);
    
    const allSlots = slotGameIds.length > 0
      ? await db
          .selectFrom("bonus_hunt_slots")
          .selectAll()
          .where("slot_game_id", "in", slotGameIds)
          .execute()
      : [];

    // Calculate statistics for each slot game
    const stats: SlotGameStats[] = slotGames.map((game) => {
      const gameSlots = allSlots.filter((s) => s.slot_game_id === game.id);
      const openedSlots = gameSlots.filter((s) => s.payout !== null);

      const totalBonuses = gameSlots.length;
      const openedBonuses = openedSlots.length;
      const totalInvested = gameSlots.reduce(
        (sum, s) => sum + Number(s.bet_size),
        0
      );
      const totalWon = openedSlots.reduce(
        (sum, s) => sum + Number(s.payout),
        0
      );

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

      return {
        id: game.id!,
        userId: game.user_id,
        name: game.name,
        normalizedName: game.normalized_name,
        timesPlayed: game.times_played || 0,
        createdAt: game.created_at!,
        updatedAt: game.updated_at!,
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
    });

    return NextResponse.json({ slotGames: stats });
  } catch (error) {
    console.error("Error fetching slot games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Invalid slot game name" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim().toLowerCase();

    // Check if it already exists
    const existing = await db
      .selectFrom("slot_games")
      .selectAll()
      .where("user_id", "=", user.id)
      .where("normalized_name", "=", normalizedName)
      .executeTakeFirst();

    if (existing) {
      // Return existing game
      return NextResponse.json({
        slotGame: {
          id: existing.id!,
          userId: existing.user_id,
          name: existing.name,
          normalizedName: existing.normalized_name,
          timesPlayed: existing.times_played || 0,
          createdAt: existing.created_at!,
          updatedAt: existing.updated_at!,
        },
      });
    }

    // Create new slot game
    const [newGame] = await db
      .insertInto("slot_games")
      .values({
        user_id: user.id,
        name: name.trim(),
        normalized_name: normalizedName,
        times_played: 0,
      })
      .returningAll()
      .execute();

    return NextResponse.json({
      slotGame: {
        id: newGame.id!,
        userId: newGame.user_id,
        name: newGame.name,
        normalizedName: newGame.normalized_name,
        timesPlayed: newGame.times_played || 0,
        createdAt: newGame.created_at!,
        updatedAt: newGame.updated_at!,
      },
    });
  } catch (error) {
    console.error("Error creating slot game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
