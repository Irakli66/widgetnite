import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

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
    const { slotId, direction } = body;

    if (!slotId || !["up", "down"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid slot ID or direction" },
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

    const slot = await db
      .selectFrom("bonus_hunt_slots")
      .select(["id", "position"])
      .where("id", "=", slotId)
      .where("hunt_id", "=", id)
      .executeTakeFirst();

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const newPosition = direction === "up" ? slot.position - 1 : slot.position + 1;

    if (newPosition < 0) {
      return NextResponse.json(
        { error: "Cannot move slot up from first position" },
        { status: 400 }
      );
    }

    const targetSlot = await db
      .selectFrom("bonus_hunt_slots")
      .select("id")
      .where("hunt_id", "=", id)
      .where("position", "=", newPosition)
      .executeTakeFirst();

    if (!targetSlot) {
      return NextResponse.json(
        { error: "Cannot move slot down from last position" },
        { status: 400 }
      );
    }

    await db
      .updateTable("bonus_hunt_slots")
      .set({ position: slot.position })
      .where("id", "=", targetSlot.id)
      .execute();

    await db
      .updateTable("bonus_hunt_slots")
      .set({ position: newPosition })
      .where("id", "=", slotId)
      .execute();

    return NextResponse.json({ message: "Slot reordered successfully" });
  } catch (error) {
    console.error("Error reordering slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
