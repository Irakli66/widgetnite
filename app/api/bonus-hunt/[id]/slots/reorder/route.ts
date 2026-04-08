import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PATCH(
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
    const { slotIds } = body; // Array of slot IDs in new order

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid slot order" },
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

    // Update positions for all slots in a transaction-like manner
    // Update each slot's position based on the new order
    const updatePromises = slotIds.map((slotId, index) =>
      db
        .updateTable("bonus_hunt_slots")
        .set({ position: index, updated_at: new Date().toISOString() })
        .where("id", "=", slotId)
        .where("hunt_id", "=", id)
        .execute()
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: "Slots reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
