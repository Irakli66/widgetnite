"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SlotGame {
  id: string;
  name: string;
}

interface SlotGameComboboxProps {
  onSelect: (slotGameId: string | null, name: string) => void;
  value?: string;
  disabled?: boolean;
}

export default function SlotGameCombobox({
  onSelect,
  value,
  disabled = false,
}: SlotGameComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [slotGames, setSlotGames] = useState<SlotGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState(value || "");

  useEffect(() => {
    const fetchSlotGames = async () => {
      if (!searchQuery) {
        setSlotGames([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/slot-games/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        if (response.ok) {
          setSlotGames(data.slotGames || []);
        }
      } catch (error) {
        console.error("Error fetching slot games:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSlotGames();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelect = (slotGame: SlotGame | null, isNewSlot: boolean) => {
    if (isNewSlot) {
      // Creating new slot with the search query
      setSelectedName(searchQuery);
      onSelect(null, searchQuery);
    } else if (slotGame) {
      // Selecting existing slot
      setSelectedName(slotGame.name);
      onSelect(slotGame.id, slotGame.name);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedName || "Select slot game..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search slot games..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {searchQuery && slotGames.length === 0 && (
                  <CommandEmpty>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleSelect(null, true)}
                    >
                      Create new: <strong className="ml-1">{searchQuery}</strong>
                    </Button>
                  </CommandEmpty>
                )}
                {slotGames.length > 0 && (
                  <CommandGroup>
                    {searchQuery &&
                      !slotGames.find(
                        (sg) => sg.name.toLowerCase() === searchQuery.toLowerCase()
                      ) && (
                        <CommandItem
                          onSelect={() => handleSelect(null, true)}
                        >
                          Create new: <strong className="ml-1">{searchQuery}</strong>
                        </CommandItem>
                      )}
                    {slotGames.map((slotGame) => (
                      <CommandItem
                        key={slotGame.id}
                        value={slotGame.name}
                        onSelect={() => handleSelect(slotGame, false)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedName === slotGame.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {slotGame.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
