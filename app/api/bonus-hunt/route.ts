import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { BonusHuntFormatted } from "@/lib/models";

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

    const hunts = await db
      .selectFrom("bonus_hunts")
      .selectAll()
      .where("user_id", "=", user.id)
      .orderBy("created_at", "desc")
      .execute();

    const transformedHunts: BonusHuntFormatted[] = hunts.map((h) => ({
      id: h.id!,
      userId: h.user_id,
      name: h.name,
      startBalance: Number(h.start_balance),
      status: (h.status as 'not_started' | 'in_progress' | 'ended') || 'not_started',
      currentSlotIndex: h.current_slot_index,
      huntResult: h.hunt_result as 'profit' | 'no_profit' | null,
      createdAt: h.created_at!,
      updatedAt: h.updated_at!,
    }));

    return NextResponse.json({ hunts: transformedHunts });
  } catch (error) {
    console.error("Error fetching bonus hunts:", error);
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
    const { name, startBalance } = body;

    if (!name || typeof startBalance !== "number" || startBalance <= 0) {
      return NextResponse.json(
        { error: "Invalid name or start balance" },
        { status: 400 }
      );
    }

    if (!user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 404 });
    }

    const [hunt] = await db
      .insertInto("bonus_hunts")
      .values({
        user_id: user.id,
        name,
        start_balance: startBalance,
      })
      .returningAll()
      .execute();

    const transformedHunt: BonusHuntFormatted = {
      id: hunt.id!,
      userId: hunt.user_id,
      name: hunt.name,
      startBalance: Number(hunt.start_balance),
      status: (hunt.status as 'not_started' | 'in_progress' | 'ended') || 'not_started',
      currentSlotIndex: hunt.current_slot_index,
      huntResult: hunt.hunt_result as 'profit' | 'no_profit' | null,
      createdAt: hunt.created_at!,
      updatedAt: hunt.updated_at!,
    };

    return NextResponse.json({
      hunt: transformedHunt,
      message: "Bonus hunt created successfully",
    });
  } catch (error) {
    console.error("Error creating bonus hunt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
