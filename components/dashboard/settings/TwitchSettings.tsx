"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TwitchSettingsProps {
  twitch: string;
  onTwitchChange: (twitch: string) => void;
}

export default function TwitchSettings({ twitch, onTwitchChange }: TwitchSettingsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="twitch" className="flex items-center gap-2">
        <span className="w-4 h-4 bg-purple-500 rounded-sm"></span>
        Twitch Username
      </Label>
      <Input
        id="twitch"
        type="text"
        value={twitch}
        onChange={(e) => onTwitchChange(e.target.value)}
        placeholder="Enter your Twitch username"
        className="max-w-md"
      />
      <p className="text-xs text-muted-foreground">
        Your Twitch channel name for streaming integration
      </p>
    </div>
  );
} 