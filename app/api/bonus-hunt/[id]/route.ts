import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { BonusHuntFormatted, BonusHuntSlotFormatted, BonusHuntWithSlots } from "@/lib/models";

// GET is public - no auth required for OBS widget display
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hunt = await db
      .selectFrom("bonus_hunts")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    // Get count of hunts for this user (to determine hunt number)
    const huntCountResult = await db
      .selectFrom("bonus_hunts")
      .select(db.fn.count("id").as("count"))
      .where("user_id", "=", hunt.user_id)
      .where("created_at", "<=", hunt.created_at!)
      .executeTakeFirst();

    const huntNumber = Number(huntCountResult?.count || 1);

    const slots = await db
      .selectFrom("bonus_hunt_slots")
      .selectAll()
      .where("hunt_id", "=", id)
      .orderBy("position", "asc")
      .execute();

    const transformedSlots: BonusHuntSlotFormatted[] = slots.map((s) => ({
      id: s.id!,
      huntId: s.hunt_id,
      slotName: s.slot_name,
      betSize: Number(s.bet_size),
      payout: s.payout ? Number(s.payout) : null,
      position: s.position,
      createdAt: s.created_at!,
      updatedAt: s.updated_at!,
    }));

    const huntWithSlots: BonusHuntWithSlots & { 
      huntNumber: number;
      status?: 'not_started' | 'in_progress' | 'ended';
      currentSlotIndex?: number | null;
      huntResult?: 'profit' | 'no_profit' | null;
    } = {
      id: hunt.id!,
      userId: hunt.user_id,
      name: hunt.name,
      startBalance: Number(hunt.start_balance),
      status: (hunt.status as 'not_started' | 'in_progress' | 'ended') || 'not_started',
      currentSlotIndex: hunt.current_slot_index,
      huntResult: hunt.hunt_result as 'profit' | 'no_profit' | null,
      createdAt: hunt.created_at!,
      updatedAt: hunt.updated_at!,
      slots: transformedSlots,
      huntNumber,
    };

    return NextResponse.json({ hunt: huntWithSlots });
  } catch (error) {
    console.error("Error fetching bonus hunt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, startBalance } = body;

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

    const updates: Partial<{ name: string; start_balance: number; updated_at: string }> = { 
      updated_at: new Date().toISOString() 
    };
    if (name !== undefined) updates.name = name;
    if (startBalance !== undefined) updates.start_balance = startBalance;

    const [updatedHunt] = await db
      .updateTable("bonus_hunts")
      .set(updates)
      .where("id", "=", id)
      .returningAll()
      .execute();

    const transformedHunt: BonusHuntFormatted = {
      id: updatedHunt.id!,
      userId: updatedHunt.user_id,
      name: updatedHunt.name,
      startBalance: Number(updatedHunt.start_balance),
      status: (updatedHunt.status as 'not_started' | 'in_progress' | 'ended') || 'not_started',
      currentSlotIndex: updatedHunt.current_slot_index,
      huntResult: updatedHunt.hunt_result as 'profit' | 'no_profit' | null,
      createdAt: updatedHunt.created_at!,
      updatedAt: updatedHunt.updated_at!,
    };

    return NextResponse.json({
      hunt: transformedHunt,
      message: "Hunt updated successfully",
    });
  } catch (error) {
    console.error("Error updating bonus hunt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    await db.deleteFrom("bonus_hunts").where("id", "=", id).execute();

    return NextResponse.json({ message: "Hunt deleted successfully" });
  } catch (error) {
    console.error("Error deleting bonus hunt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
