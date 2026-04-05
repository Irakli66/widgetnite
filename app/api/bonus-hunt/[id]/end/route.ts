import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { result } = body;

    if (!result || !["profit", "no_profit"].includes(result)) {
      return NextResponse.json(
        { error: "Invalid result. Must be 'profit' or 'no_profit'" },
        { status: 400 }
      );
    }

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hunt = await db
      .selectFrom("bonus_hunts")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    const updatedHunt = await db
      .updateTable("bonus_hunts")
      .set({
        status: "ended",
        hunt_result: result,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!updatedHunt) {
      return NextResponse.json(
        { error: "Failed to end hunt" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hunt: {
        id: updatedHunt.id,
        userId: updatedHunt.user_id,
        name: updatedHunt.name,
        startBalance: Number(updatedHunt.start_balance),
        status: updatedHunt.status,
        currentSlotIndex: updatedHunt.current_slot_index,
        huntResult: updatedHunt.hunt_result,
        createdAt: updatedHunt.created_at,
        updatedAt: updatedHunt.updated_at,
      },
    });
  } catch (error) {
    console.error("Error ending hunt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
