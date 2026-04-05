"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import SlotGameDetailsDialog from "@/components/bonus-hunt/SlotGameDetailsDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SlotGameStats } from "@/lib/models";

type SortField = keyof Pick<
  SlotGameStats,
  | "name"
  | "totalBonuses"
  | "bestMultiplier"
  | "bestPayout"
  | "avgMultiplier"
  | "totalWon"
  | "netProfit"
>;

export default function SlotStatsPage() {
  const { data: session, status } = useSession();
  const [slotGames, setSlotGames] = useState<SlotGameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalBonuses");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedSlotGame, setSelectedSlotGame] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    slotGameId: string;
    slotGameName: string;
  }>({
    open: false,
    slotGameId: "",
    slotGameName: "",
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchSlotGames();
    }
  }, [session?.user?.email]);

  const fetchSlotGames = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/slot-games");
      const data = await response.json();
      
      if (response.ok) {
        setSlotGames(data.slotGames);
      } else {
        setError(data.error || "Failed to fetch slot games");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDeleteClick = (slotGameId: string, slotGameName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click from triggering
    setConfirmDelete({
      open: true,
      slotGameId,
      slotGameName,
    });
  };

  const confirmDeleteSlotGame = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/slot-games/${confirmDelete.slotGameId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Slot game deleted successfully!");
        setConfirmDelete({ open: false, slotGameId: "", slotGameName: "" });
        fetchSlotGames(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete slot game");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete slot game");
    } finally {
      setDeleting(false);
    }
  };

  const sortedSlotGames = [...slotGames].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please sign in to view slot statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Target className="h-10 w-10 text-primary" />
          Slot Game Statistics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track performance across all your slot games
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Slot Games</CardTitle>
            <CardDescription>
              Click column headers to sort
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading slot games...</div>
              </div>
            ) : slotGames.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No slot games yet</h3>
                <p className="text-muted-foreground">
                  Add slots to your bonus hunts to start tracking statistics
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("name")}
                      >
                        Slot Name
                        {sortField === "name" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("totalBonuses")}
                      >
                        Bonuses
                        {sortField === "totalBonuses" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("bestMultiplier")}
                      >
                        Best Multi
                        {sortField === "bestMultiplier" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("bestPayout")}
                      >
                        Best Payout
                        {sortField === "bestPayout" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("avgMultiplier")}
                      >
                        Avg Multi
                        {sortField === "avgMultiplier" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("totalWon")}
                      >
                        Total Won
                        {sortField === "totalWon" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("netProfit")}
                      >
                        Net Profit
                        {sortField === "netProfit" && (sortDirection === "asc" ? " ↑" : " ↓")}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSlotGames.map((game) => (
                      <TableRow
                        key={game.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setSelectedSlotGame({ id: game.id, name: game.name })
                        }
                      >
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell className="text-right">
                          {game.totalBonuses}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({game.openedBonuses} opened)
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-500">
                          {game.bestMultiplier.toFixed(2)}x
                        </TableCell>
                        <TableCell className="text-right font-semibold text-amber-500">
                          ${game.bestPayout.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {game.avgMultiplier.toFixed(2)}x
                        </TableCell>
                        <TableCell className="text-right">
                          ${game.totalWon.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            game.netProfit >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {game.netProfit >= 0 ? "+" : ""}${game.netProfit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(game.id, game.name, e)}
                            disabled={deleting}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <SlotGameDetailsDialog
        open={!!selectedSlotGame}
        onOpenChange={(open) => !open && setSelectedSlotGame(null)}
        slotGameId={selectedSlotGame?.id || null}
        slotGameName={selectedSlotGame?.name || ""}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
        title="Delete Slot Game"
        description={`Are you sure you want to delete "${confirmDelete.slotGameName}"? This will remove all associated bonus data. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDeleteSlotGame}
      />
    </div>
  );
}
