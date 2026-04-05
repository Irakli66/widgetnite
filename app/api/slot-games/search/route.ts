import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    
    if (!query) {
      return NextResponse.json({ slotGames: [] });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // Search for slot games matching the query
    const slotGames = await db
      .selectFrom("slot_games")
      .select(["id", "name", "normalized_name"])
      .where("user_id", "=", user.id)
      .where(sql<boolean>`normalized_name ILIKE ${`%${normalizedQuery}%`}`)
      .orderBy("name", "asc")
      .limit(10)
      .execute();

    return NextResponse.json({
      slotGames: slotGames.map((sg) => ({
        id: sg.id,
        name: sg.name,
      })),
    });
  } catch (error) {
    console.error("Error searching slot games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
