import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ClashRoyaleChallengeFormatted } from "@/lib/models";

// GET - Fetch a specific challenge (UNPROTECTED for OBS)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challenge = await db
      .selectFrom("clash_royale_challenges")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const transformedChallenge: ClashRoyaleChallengeFormatted = {
      id: challenge.id!,
      userId: challenge.user_id,
      name: challenge.name,
      winGoal: challenge.win_goal,
      maxLosses: challenge.max_losses,
      currentWins: challenge.current_wins ?? 0,
      currentLosses: challenge.current_losses ?? 0,
      bestWins: challenge.best_wins ?? 0,
      bestLosses: challenge.best_losses ?? 0,
      totalAttempts: challenge.total_attempts ?? 0,
      isActive: challenge.is_active ?? true,
      createdAt: challenge.created_at!,
      updatedAt: challenge.updated_at!,
    };

    return NextResponse.json({ challenge: transformedChallenge });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a challenge
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

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existingChallenge = await db
      .selectFrom("clash_royale_challenges")
      .select("user_id")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!existingChallenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (existingChallenge.user_id !== user.id as string) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: {
      updated_at: string;
      name?: string;
      win_goal?: number;
      max_losses?: number;
      is_active?: boolean;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.winGoal !== undefined) updateData.win_goal = body.winGoal;
    if (body.maxLosses !== undefined) updateData.max_losses = body.maxLosses;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const [updatedChallenge] = await db
      .updateTable("clash_royale_challenges")
      .set(updateData)
      .where("id", "=", id)
      .returning([
        "id",
        "user_id",
        "name",
        "win_goal",
        "max_losses",
        "current_wins",
        "current_losses",
        "best_wins",
        "best_losses",
        "total_attempts",
        "is_active",
        "created_at",
        "updated_at",
      ])
      .execute();

    const transformedChallenge: ClashRoyaleChallengeFormatted = {
      id: updatedChallenge.id!,
      userId: updatedChallenge.user_id,
      name: updatedChallenge.name,
      winGoal: updatedChallenge.win_goal,
      maxLosses: updatedChallenge.max_losses,
      currentWins: updatedChallenge.current_wins ?? 0,
      currentLosses: updatedChallenge.current_losses ?? 0,
      bestWins: updatedChallenge.best_wins ?? 0,
      bestLosses: updatedChallenge.best_losses ?? 0,
      totalAttempts: updatedChallenge.total_attempts ?? 0,
      isActive: updatedChallenge.is_active ?? true,
      createdAt: updatedChallenge.created_at!,
      updatedAt: updatedChallenge.updated_at!,
    };

    return NextResponse.json({
      challenge: transformedChallenge,
      message: "Challenge updated successfully",
    });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a challenge
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

    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user || !user.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify ownership
    const existingChallenge = await db
      .selectFrom("clash_royale_challenges")
      .select("user_id")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!existingChallenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (existingChallenge.user_id !== user.id as string) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await db
      .deleteFrom("clash_royale_challenges")
      .where("id", "=", id)
      .execute();

    return NextResponse.json({
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

