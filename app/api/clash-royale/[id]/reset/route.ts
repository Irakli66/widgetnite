import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ClashRoyaleChallengeFormatted } from "@/lib/models";

// POST - Reset current attempt (start a new run)
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

    const currentWins = challenge.current_wins ?? 0;
    const currentLosses = challenge.current_losses ?? 0;
    const bestWins = challenge.best_wins ?? 0;
    const bestLosses = challenge.best_losses ?? 0;
    const totalAttempts = challenge.total_attempts ?? 0;

    // Prepare update data
    const updateData: {
      current_wins: number;
      current_losses: number;
      updated_at: string;
      best_wins?: number;
      best_losses?: number;
      total_attempts?: number;
    } = {
      current_wins: 0,
      current_losses: 0,
      updated_at: new Date().toISOString(),
    };

    // If there were any wins/losses in current attempt, consider it a new attempt
    if (currentWins > 0 || currentLosses > 0) {
      // Update best run if current is better
      if (currentWins > bestWins ||
          (currentWins === bestWins && currentLosses < bestLosses)) {
        updateData.best_wins = currentWins;
        updateData.best_losses = currentLosses;
      }
      updateData.total_attempts = totalAttempts + 1;
    }

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
      message: "Challenge reset successfully",
    });
  } catch (error) {
    console.error("Error resetting challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

