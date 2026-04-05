import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

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

    // Verify the slot game belongs to this user
    const slotGame = await db
      .selectFrom("slot_games")
      .select("id")
      .where("id", "=", id)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!slotGame) {
      return NextResponse.json(
        { error: "Slot game not found" },
        { status: 404 }
      );
    }

    // Get all bonuses for this slot game with hunt names
    const bonuses = await db
      .selectFrom("bonus_hunt_slots")
      .innerJoin("bonus_hunts", "bonus_hunts.id", "bonus_hunt_slots.hunt_id")
      .select([
        "bonus_hunt_slots.id",
        "bonus_hunts.name as hunt_name",
        "bonus_hunt_slots.bet_size",
        "bonus_hunt_slots.payout",
        "bonus_hunt_slots.created_at",
      ])
      .where("bonus_hunt_slots.slot_game_id", "=", id)
      .orderBy("bonus_hunt_slots.created_at", "desc")
      .execute();

    const transformedBonuses = bonuses.map((b) => ({
      id: b.id!,
      huntName: b.hunt_name,
      betSize: Number(b.bet_size),
      payout: b.payout ? Number(b.payout) : null,
      multiplier:
        b.payout !== null ? Number(b.payout) / Number(b.bet_size) : null,
      createdAt: b.created_at!,
    }));

    return NextResponse.json({ bonuses: transformedBonuses });
  } catch (error) {
    console.error("Error fetching slot game bonuses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
