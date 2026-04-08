import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { BonusHuntSlotFormatted } from "@/lib/models";
import { sql } from "kysely";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, slotId } = await params;
    const body = await req.json();
    const { slotName, betSize, payout, isSuper } = body;

    const slot = await db
      .selectFrom("bonus_hunt_slots")
      .select("hunt_id")
      .where("id", "=", slotId)
      .executeTakeFirst();

    if (!slot || slot.hunt_id !== id) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
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

    const updates: Partial<{ slot_name: string; bet_size: number; payout: number | null; is_super: boolean; updated_at: string }> = { 
      updated_at: new Date().toISOString() 
    };
    if (slotName !== undefined) updates.slot_name = slotName;
    if (betSize !== undefined) updates.bet_size = betSize;
    if (payout !== undefined) updates.payout = payout;
    if (isSuper !== undefined) updates.is_super = isSuper;

    const [updatedSlot] = await db
      .updateTable("bonus_hunt_slots")
      .set(updates)
      .where("id", "=", slotId)
      .returning([
        "id",
        "hunt_id",
        "slot_name",
        "bet_size",
        "payout",
        "position",
        "slot_game_id",
        "is_super",
        "created_at",
        "updated_at",
      ])
      .execute();

    // Auto-advance current_slot_index if payout is being set
    if (payout !== undefined && payout !== null) {
      const huntData = await db
        .selectFrom("bonus_hunts")
        .select(["current_slot_index", "status"])
        .where("id", "=", id)
        .executeTakeFirst();

      if (huntData && huntData.status === "in_progress") {
        // Get total number of slots
        const totalSlots = await db
          .selectFrom("bonus_hunt_slots")
          .select(db.fn.count<number>("id").as("count"))
          .where("hunt_id", "=", id)
          .executeTakeFirst();

        const slotCount = totalSlots?.count || 0;
        const currentIndex = huntData.current_slot_index ?? -1;
        const nextIndex = currentIndex + 1;

        // Update current_slot_index: increment or set to null if all slots are done
        await db
          .updateTable("bonus_hunts")
          .set({
            current_slot_index: nextIndex >= slotCount ? null : nextIndex,
            updated_at: new Date().toISOString(),
          })
          .where("id", "=", id)
          .execute();
      }
    }

    const transformedSlot: BonusHuntSlotFormatted = {
      id: updatedSlot.id!,
      huntId: updatedSlot.hunt_id,
      slotName: updatedSlot.slot_name,
      betSize: Number(updatedSlot.bet_size),
      payout: updatedSlot.payout ? Number(updatedSlot.payout) : null,
      position: updatedSlot.position,
      slotGameId: updatedSlot.slot_game_id,
      isSuper: updatedSlot.is_super || false,
      createdAt: updatedSlot.created_at!,
      updatedAt: updatedSlot.updated_at!,
    };

    return NextResponse.json({
      slot: transformedSlot,
      message: "Slot updated successfully",
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, slotId } = await params;

    const slot = await db
      .selectFrom("bonus_hunt_slots")
      .select(["hunt_id", "position"])
      .where("id", "=", slotId)
      .executeTakeFirst();

    if (!slot || slot.hunt_id !== id) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
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

    await db.deleteFrom("bonus_hunt_slots").where("id", "=", slotId).execute();

    await db
      .updateTable("bonus_hunt_slots")
      .set({
        position: sql`position - 1`,
        updated_at: new Date().toISOString(),
      })
      .where("hunt_id", "=", id)
      .where("position", ">", slot.position)
      .execute();

    return NextResponse.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
