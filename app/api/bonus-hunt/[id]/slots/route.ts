import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { BonusHuntSlotFormatted } from "@/lib/models";
import { sql } from "kysely";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { slotName, betSize, slotGameId } = body;

    if (!slotName || typeof betSize !== "number" || betSize <= 0) {
      return NextResponse.json(
        { error: "Invalid slot name or bet size" },
        { status: 400 },
      );
    }

    const hunt = await db
      .selectFrom("bonus_hunts")
      .select("user_id")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user || !user.id || hunt.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Handle slot game linking
    let finalSlotGameId: string | null = null;

    if (slotGameId) {
      // Use provided slot game ID
      finalSlotGameId = slotGameId;
    } else {
      // Search for existing slot game or create new one
      const normalizedName = slotName.trim().toLowerCase();

      const slotGame = await db
        .selectFrom("slot_games")
        .select("id")
        .where("user_id", "=", user.id)
        .where("normalized_name", "=", normalizedName)
        .executeTakeFirst();

      if (!slotGame) {
        // Create new slot game
        const [newSlotGame] = await db
          .insertInto("slot_games")
          .values({
            user_id: user.id,
            name: slotName.trim(),
            normalized_name: normalizedName,
            times_played: 0,
          })
          .returning(["id"])
          .execute();

        finalSlotGameId = newSlotGame.id!;
      } else {
        finalSlotGameId = slotGame.id!;
      }
    }

    // Increment times_played for the slot game
    if (finalSlotGameId) {
      await db
        .updateTable("slot_games")
        .set({
          times_played: sql`times_played + 1`,
          updated_at: new Date().toISOString(),
        })
        .where("id", "=", finalSlotGameId)
        .execute();
    }

    const maxPosition = await db
      .selectFrom("bonus_hunt_slots")
      .select(db.fn.max("position").as("max_position"))
      .where("hunt_id", "=", id)
      .executeTakeFirst();

    const nextPosition = (maxPosition?.max_position ?? -1) + 1;

    const [slot] = await db
      .insertInto("bonus_hunt_slots")
      .values({
        hunt_id: id,
        slot_name: slotName,
        bet_size: betSize,
        position: nextPosition,
        slot_game_id: finalSlotGameId,
      })
      .returningAll()
      .execute();

    const transformedSlot: BonusHuntSlotFormatted = {
      id: slot.id!,
      huntId: slot.hunt_id,
      slotName: slot.slot_name,
      betSize: Number(slot.bet_size),
      payout: slot.payout ? Number(slot.payout) : null,
      position: slot.position,
      slotGameId: slot.slot_game_id,
      createdAt: slot.created_at!,
      updatedAt: slot.updated_at!,
    };

    return NextResponse.json({
      slot: transformedSlot,
      message: "Slot added successfully",
    });
  } catch (error) {
    console.error("Error adding slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
