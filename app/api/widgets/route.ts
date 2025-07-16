import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { WidgetFormatted } from "@/lib/models";

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const widgets = await db
      .selectFrom("widgets")
      .selectAll()
      .where("user_id", "=", user.id)
      .orderBy("created_at", "desc")
      .execute();

    const transformedWidgets: WidgetFormatted[] = widgets.map((w) => ({
      id: w.id,
      userId: w.user_id,
      type: w.type as "faceit-stats",
      name: w.name,
      compact: w.compact,
      colorTheme: w.color_theme as "blue" | "violet" | "green" | "red",
      showProfile: w.show_profile,
      widgetUrl: w.widget_url,
      faceitUsername: w.faceit_username || undefined,
      created_at: w.created_at,
      updated_at: w.updated_at,
    }));

    return NextResponse.json({ widgets: transformedWidgets });
  } catch (error) {
    console.error("Error fetching widgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, compact, colorTheme, showProfile, faceitUsername } = body;

    if (
      !name ||
      typeof compact !== "boolean" ||
      !colorTheme ||
      typeof showProfile !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    if (!["blue", "violet", "green", "red"].includes(colorTheme)) {
      return NextResponse.json(
        { error: "Invalid color theme" },
        { status: 400 }
      );
    }

    const baseUrl = req.nextUrl.origin;
    const params = new URLSearchParams({
      username: faceitUsername || "",
      compact: compact.toString(),
      theme: colorTheme,
      showProfile: showProfile.toString(),
    });
    const widgetUrl = `${baseUrl}/widget/faceit-stats?${params.toString()}`;

    const [widget] = await db
      .insertInto("widgets")
      .values({
        user_id: user.id,
        type: "faceit-stats",
        name,
        compact,
        color_theme: colorTheme,
        show_profile: showProfile,
        widget_url: widgetUrl,
        ...(faceitUsername && { faceit_username: faceitUsername }),
      })
      .returning([
        "id",
        "user_id",
        "type",
        "name",
        "compact",
        "color_theme",
        "show_profile",
        "widget_url",
        "faceit_username",
        "created_at",
        "updated_at",
      ])
      .execute();

    const transformedWidget: WidgetFormatted = {
      id: widget.id,
      userId: widget.user_id,
      type: widget.type as "faceit-stats",
      name: widget.name,
      compact: widget.compact,
      colorTheme: widget.color_theme as "blue" | "violet" | "green" | "red",
      showProfile: widget.show_profile,
      widgetUrl: widget.widget_url,
      faceitUsername: widget.faceit_username || undefined,
      created_at: widget.created_at,
      updated_at: widget.updated_at,
    };

    return NextResponse.json({
      widget: transformedWidget,
      message: "Widget created successfully",
    });
  } catch (error) {
    console.error("Error creating widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
