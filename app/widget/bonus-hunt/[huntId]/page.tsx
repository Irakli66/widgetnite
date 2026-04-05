"use client";

import { use } from "react";
import BonusHuntWidget from "@/components/bonus-hunt/BonusHuntWidget";

export default function BonusHuntWidgetPage({
  params,
}: {
  params: Promise<{ huntId: string }>;
}) {
  const { huntId } = use(params);

  return (
    <div className="min-h-screen bg-transparent">
      <BonusHuntWidget huntId={huntId} />
    </div>
  );
}
