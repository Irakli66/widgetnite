import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { faceit, faceitId, twitch, kick } = body;

    if (
      faceit === undefined &&
      faceitId === undefined &&
      twitch === undefined &&
      kick === undefined
    ) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    const updateData: {
      faceit?: string | null;
      faceitId?: string | null;
      twitch?: string | null;
      kick?: string | null;
    } = {};

    if (faceit !== undefined) updateData.faceit = faceit;
    if (faceitId !== undefined) updateData.faceitId = faceitId;
    if (twitch !== undefined) updateData.twitch = twitch;
    if (kick !== undefined) updateData.kick = kick;

    const updatedUser = await db
      .updateTable("users")
      .set(updateData)
      .where("email", "=", session.user.email)
      .returningAll()
      .executeTakeFirst();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
