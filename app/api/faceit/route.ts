import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nickname = searchParams.get("nickname");

    if (!nickname) {
      return NextResponse.json(
        { error: "Nickname parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FACEIT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Faceit API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(
        nickname
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Player not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch player data from Faceit" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      playerId: data.player_id,
      nickname: data.nickname,
      avatar: data.avatar,
      country: data.country,
      faceitLevel:
        data.games?.cs2?.skill_level || data.games?.csgo?.skill_level || null,
      faceitElo:
        data.games?.cs2?.faceit_elo || data.games?.csgo?.faceit_elo || null,
    });
  } catch (error) {
    console.error("Error fetching Faceit data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
