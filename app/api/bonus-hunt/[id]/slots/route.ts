import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { BonusHuntSlotFormatted } from "@/lib/models";

export async function POST(
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
    const body = await req.json();
    const { slotName, betSize } = body;

    if (!slotName || typeof betSize !== "number" || betSize <= 0) {
      return NextResponse.json(
        { error: "Invalid slot name or bet size" },
        { status: 400 }
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
      })
      .returning([
        "id",
        "hunt_id",
        "slot_name",
        "bet_size",
        "payout",
        "position",
        "created_at",
        "updated_at",
      ])
      .execute();

    const transformedSlot: BonusHuntSlotFormatted = {
      id: slot.id!,
      huntId: slot.hunt_id,
      slotName: slot.slot_name,
      betSize: Number(slot.bet_size),
      payout: slot.payout ? Number(slot.payout) : null,
      position: slot.position,
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
      { status: 500 }
    );
  }
}
