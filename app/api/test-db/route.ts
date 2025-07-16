// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const users = await db.selectFrom("users").selectAll().execute();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
