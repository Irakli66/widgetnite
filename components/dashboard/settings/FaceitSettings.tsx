"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FaceitData {
  playerId: string;
  nickname: string;
  avatar: string;
  country: string;
  faceitLevel: number | null;
  faceitElo: number | null;
}

interface FaceitSettingsProps {
  faceit: string;
  faceitId: string;
  onFaceitChange: (faceit: string) => void;
  onFaceitIdChange: (faceitId: string) => void;
}

export default function FaceitSettings({
  faceit,
  faceitId,
  onFaceitChange,
  onFaceitIdChange,
}: FaceitSettingsProps) {
  const [fetchingFaceit, setFetchingFaceit] = useState(false);
  const [faceitError, setFaceitError] = useState<string | null>(null);
  const [faceitData, setFaceitData] = useState<FaceitData | null>(null);
  const [lastSearchedUsername, setLastSearchedUsername] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchFaceitData = useCallback(
    async (nickname: string) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const trimmedNickname = nickname.trim();

      // Don't search if empty or if we already searched this username
      if (!trimmedNickname) {
        setFaceitData(null);
        setFaceitError(null);
        setLastSearchedUsername("");
        if (faceitId) {
          onFaceitIdChange("");
        }
        return;
      }

      // Don't search if we already searched this username and have the ID
      if (trimmedNickname === lastSearchedUsername && faceitId) {
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setFetchingFaceit(true);
      setFaceitError(null);

      try {
        const response = await fetch(
          `/api/faceit?nickname=${encodeURIComponent(trimmedNickname)}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setFaceitData(data);
          setLastSearchedUsername(trimmedNickname);
          onFaceitIdChange(data.playerId);
        } else {
          setFaceitError(data.error || "Failed to fetch Faceit data");
          setFaceitData(null);
          setLastSearchedUsername("");
          onFaceitIdChange("");
        }
      } catch (err: unknown) {
        // Don't show error for aborted requests
        if (
          typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name?: string }).name !== "AbortError"
        ) {
          setFaceitError("Network error occurred");
          setFaceitData(null);
          setLastSearchedUsername("");
          onFaceitIdChange("");
        }
      } finally {
        setFetchingFaceit(false);
      }
    },
    [onFaceitIdChange, faceitId, lastSearchedUsername]
  );

  // Effect to check if we need to fetch data for existing faceit username
  useEffect(() => {
    const trimmedFaceit = faceit.trim();

    // If we have a faceit username but no ID, and we haven't searched this username yet
    if (trimmedFaceit && !faceitId && trimmedFaceit !== lastSearchedUsername) {
      // Immediate search for existing usernames (no debounce)
      fetchFaceitData(trimmedFaceit);
    }
  }, [faceit, faceitId, fetchFaceitData, lastSearchedUsername]);

  // Debounced search for new input
  useEffect(() => {
    const trimmedFaceit = faceit.trim();

    // Only debounce if this is a new username being typed
    if (trimmedFaceit && trimmedFaceit !== lastSearchedUsername) {
      const timeoutId = setTimeout(() => {
        fetchFaceitData(trimmedFaceit);
      }, 500); // 500ms delay

      return () => {
        clearTimeout(timeoutId);
        // Cancel any ongoing request when component unmounts or faceit changes
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    } else if (!trimmedFaceit) {
      // Clear data immediately when input is empty
      setFaceitData(null);
      setFaceitError(null);
      setLastSearchedUsername("");
      if (faceitId) {
        onFaceitIdChange("");
      }
    }
  }, [
    faceit,
    fetchFaceitData,
    lastSearchedUsername,
    faceitId,
    onFaceitIdChange,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="faceit" className="flex items-center gap-2">
          <span className="w-4 h-4 bg-orange-500 rounded-sm"></span>
          Faceit Username
        </Label>
        <Input
          id="faceit"
          type="text"
          value={faceit}
          onChange={(e) => onFaceitChange(e.target.value)}
          placeholder="Enter your Faceit username"
          className="max-w-md"
        />
        {fetchingFaceit && (
          <p className="text-xs text-muted-foreground">
            🔍 Looking up Faceit profile...
          </p>
        )}
        {faceitError && (
          <p className="text-xs text-destructive">❌ {faceitError}</p>
        )}
        {faceitData && (
          <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
            <p>✅ Found: {faceitData.nickname}</p>
            {faceitData.faceitLevel && (
              <p>
                🏆 Level {faceitData.faceitLevel} ({faceitData.faceitElo} ELO)
              </p>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Your Faceit profile username for CS2 and other competitive games
        </p>
      </div>

      {/* Faceit ID (Auto-populated, disabled) */}
      <div className="space-y-2">
        <Label
          htmlFor="faceitId"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span className="w-4 h-4 bg-orange-500/50 rounded-sm"></span>
          Faceit Player ID
        </Label>
        <Input
          id="faceitId"
          type="text"
          value={faceitId}
          disabled
          placeholder="Auto-populated when username is found"
          className="max-w-md bg-muted/50 text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Automatically retrieved from Faceit API (read-only)
        </p>
      </div>
    </div>
  );
}
