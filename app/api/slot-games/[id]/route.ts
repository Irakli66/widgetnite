import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function DELETE(
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

    // Verify ownership of the slot game
    const slotGame = await db
      .selectFrom("slot_games")
      .select(["id", "user_id"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!slotGame) {
      return NextResponse.json(
        { error: "Slot game not found" },
        { status: 404 }
      );
    }

    if (slotGame.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the slot game (cascade will handle bonus_hunt_slots)
    await db
      .deleteFrom("slot_games")
      .where("id", "=", id)
      .execute();

    return NextResponse.json({
      message: "Slot game deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slot game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
