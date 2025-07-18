import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let faceitUsername =
      searchParams.get("username") || searchParams.get("nickname");

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
          {
            error:
              "No Faceit username found. Please set your Faceit username in settings or provide username parameter.",
          },
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

    const response = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(
        faceitUsername
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Faceit data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
