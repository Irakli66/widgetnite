import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ClashRoyaleChallengeFormatted } from "@/lib/models";

// GET - Fetch all challenges for the authenticated user
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

    const challenges = await db
      .selectFrom("clash_royale_challenges")
      .selectAll()
      .where("user_id", "=", user.id as string)
      .orderBy("created_at", "desc")
      .execute();

    const transformedChallenges: ClashRoyaleChallengeFormatted[] = challenges.map((c) => ({
      id: c.id!,
      userId: c.user_id,
      name: c.name,
      winGoal: c.win_goal,
      maxLosses: c.max_losses,
      currentWins: c.current_wins ?? 0,
      currentLosses: c.current_losses ?? 0,
      bestWins: c.best_wins ?? 0,
      bestLosses: c.best_losses ?? 0,
      totalAttempts: c.total_attempts ?? 0,
      isActive: c.is_active ?? true,
      createdAt: c.created_at!,
      updatedAt: c.updated_at!,
    }));

    return NextResponse.json({ challenges: transformedChallenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new challenge
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
    const { name, winGoal, maxLosses } = body;

    if (!name || !winGoal || !maxLosses) {
      return NextResponse.json(
        { error: "Missing required fields: name, winGoal, maxLosses" },
        { status: 400 }
      );
    }

    if (winGoal < 1 || maxLosses < 1) {
      return NextResponse.json(
        { error: "Win goal and max losses must be at least 1" },
        { status: 400 }
      );
    }

    const [challenge] = await db
      .insertInto("clash_royale_challenges")
      .values({
        user_id: user.id as string,
        name,
        win_goal: winGoal,
        max_losses: maxLosses,
        current_wins: 0,
        current_losses: 0,
        best_wins: 0,
        best_losses: 0,
        total_attempts: 0,
        is_active: true,
      })
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

    return NextResponse.json({
      challenge: transformedChallenge,
      message: "Challenge created successfully",
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

