import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get faceit username from URL params first (for OBS widget URLs)
    const { searchParams } = new URL(req.url);
    let faceitUsername = searchParams.get("username");

    // If no username in params, try to get from authenticated user profile
    if (!faceitUsername) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Username parameter required or authentication needed" },
          { status: 400 }
        );
      }

      const user = await db
        .selectFrom("users")
        .select(["faceit"])
        .where("email", "=", session.user.email)
        .executeTakeFirst();

      if (!user?.faceit) {
        return NextResponse.json(
          { error: "No Faceit username found. Please set your Faceit username in settings or provide username parameter." },
          { status: 400 }
        );
      }

      faceitUsername = user.faceit;
    }

    const apiKey = process.env.FACEIT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Faceit API key not configured" },
        { status: 500 }
      );
    }

    // First, get the player ID from nickname
    const playerResponse = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(faceitUsername)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!playerResponse.ok) {
      if (playerResponse.status === 404) {
        return NextResponse.json(
          { error: "Faceit player not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch player data" },
        { status: playerResponse.status }
      );
    }

    const playerData = await playerResponse.json();
    const playerId = playerData.player_id;

    // Now get the stats using the player ID
    const statsResponse = await fetch(
      `https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!statsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch stats data" },
        { status: statsResponse.status }
      );
    }

    const statsData = await statsResponse.json();
    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Error fetching Faceit stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
