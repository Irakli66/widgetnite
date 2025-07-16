"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KickSettingsProps {
  kick: string;
  onKickChange: (kick: string) => void;
}

export default function KickSettings({ kick, onKickChange }: KickSettingsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="kick" className="flex items-center gap-2">
        <span className="w-4 h-4 bg-green-500 rounded-sm"></span>
        Kick Username
      </Label>
      <Input
        id="kick"
        type="text"
        value={kick}
        onChange={(e) => onKickChange(e.target.value)}
        placeholder="Enter your Kick username"
        className="max-w-md"
      />
      <p className="text-xs text-muted-foreground">
        Your Kick channel name for streaming integration
      </p>
    </div>
  );
} 