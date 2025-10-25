import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ClashRoyaleChallengeFormatted } from "@/lib/models";

// POST - Increment win count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current challenge state
    const challenge = await db
      .selectFrom("clash_royale_challenges")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check if challenge is already completed (reached max losses)
    if ((challenge.current_losses ?? 0) >= challenge.max_losses) {
      return NextResponse.json(
        { error: "Challenge is already over (max losses reached)" },
        { status: 400 }
      );
    }

    const newWins = (challenge.current_wins ?? 0) + 1;
    
    // Update the challenge
    const [updatedChallenge] = await db
      .updateTable("clash_royale_challenges")
      .set({
        current_wins: newWins,
        updated_at: new Date().toISOString(),
      })
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
      message: "Win recorded successfully",
    });
  } catch (error) {
    console.error("Error recording win:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

