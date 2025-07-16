"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import FaceitStats from "@/components/widgets/faceit/FaceitStats";

function FaceitStatsWidget() {
  const searchParams = useSearchParams();

  const username = searchParams.get("username") || "";
  const compact = searchParams.get("compact") === "true";
  const theme =
    (searchParams.get("theme") as "blue" | "violet" | "green" | "red") ||
    "blue";
  const showProfile = searchParams.get("showProfile") !== "false"; // Default to true

  const validThemes = ["blue", "violet", "green", "red"];
  const validatedTheme = validThemes.includes(theme) ? theme : "blue";

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
      <FaceitStats
        faceitUsername={username}
        compact={compact}
        colorTheme={validatedTheme}
        showProfile={showProfile}
      />
    </div>
  );
}

export default function FaceitStatsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
          <div className="text-center text-white">Loading widget...</div>
        </div>
      }
    >
      <FaceitStatsWidget />
    </Suspense>
  );
}
