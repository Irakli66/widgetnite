import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

type ItemType = {
  match_id: string;
  stats: {
    [key: string]: string;
  };
};

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

    // Now get the match history using the player ID
    const historyRes = await fetch(
      `https://open.faceit.com/data/v4/players/${playerId}/games/cs2/stats?limit=30`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!historyRes.ok) {
      return NextResponse.json(
        { error: "History fetch failed" },
        { status: historyRes.status }
      );
    }

    const historyData = await historyRes.json();
    const matchIds = historyData.items.map((item: ItemType) => item.match_id);

    let kills = 0;
    let deaths = 0;
    let assists = 0;
    let hspercent = 0;
    let wins = 0;
    let elo = 0;

    for (const match of historyData.items) {
      kills += parseInt(match.stats["Kills"]);
      deaths += parseInt(match.stats["Deaths"]);
      assists += parseInt(match.stats["Assists"]);
      elo += parseInt(match.stats["Elo"]);
      hspercent += parseFloat(match.stats["Headshots %"]);
      if (match.stats["Result"] === "1") {
        wins++;
      }
    }

    const kd = kills / deaths;
    const hsPercent = hspercent / 30;
    const winRate = (wins / matchIds.length) * 100;

    return NextResponse.json({
      kd: kd.toFixed(2),
      hsPercent: hsPercent.toFixed(0),
      winRate: winRate.toFixed(0),
      loses: matchIds.length - wins,
      kills: kills,
      deaths: deaths,
      wins,
      avAssists: (assists / 30).toFixed(0),
      avKills: (kills / 30).toFixed(0),
      avDeaths: (deaths / 30).toFixed(0),
      elo: elo,
      lastGameStas: historyData.items[0].stats,
      matchCount: matchIds.length,
    });
  } catch (err) {
    console.error("Error fetching Faceit matches:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
