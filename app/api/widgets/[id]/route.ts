import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { WidgetFormatted } from "@/lib/models";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID from database
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

    // Validate widget exists and belongs to user
    const existingWidget = await db
      .selectFrom("widgets")
      .selectAll()
      .where("id", "=", id)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (!existingWidget) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    // Build update object dynamically
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (compact !== undefined) updateData.compact = compact;
    if (colorTheme !== undefined) updateData.color_theme = colorTheme;
    if (showProfile !== undefined) updateData.show_profile = showProfile;
    if (faceitUsername !== undefined)
      updateData.faceit_username = faceitUsername;

    // Update widget URL if relevant fields changed
    if (
      compact !== undefined ||
      colorTheme !== undefined ||
      showProfile !== undefined ||
      faceitUsername !== undefined
    ) {
      const baseUrl = req.nextUrl.origin;
      const params = new URLSearchParams({
        username:
          faceitUsername !== undefined
            ? faceitUsername
            : existingWidget.faceit_username || "",
        compact: (compact !== undefined
          ? compact
          : existingWidget.compact
        ).toString(),
        theme:
          colorTheme !== undefined ? colorTheme : existingWidget.color_theme,
        showProfile: (showProfile !== undefined
          ? showProfile
          : existingWidget.show_profile
        ).toString(),
      });
      updateData.widget_url = `${baseUrl}/widget/faceit-stats?${params.toString()}`;
    }

    // Update widget in database
    const [widget] = await db
      .updateTable("widgets")
      .set(updateData)
      .where("id", "=", id)
      .where("user_id", "=", user.id)
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

    // Transform to match WidgetFormatted interface
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
      message: "Widget updated successfully",
    });
  } catch (error) {
    console.error("Error updating widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID from database
    const user = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", session.user.email)
      .executeTakeFirst();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete widget (only if it belongs to the user)
    const result = await db
      .deleteFrom("widgets")
      .where("id", "=", id)
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    if (Number(result.numDeletedRows) === 0) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Widget deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
