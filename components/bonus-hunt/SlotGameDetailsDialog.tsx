"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface BonusDetail {
  id: string;
  huntName: string;
  betSize: number;
  payout: number | null;
  multiplier: number | null;
  createdAt: string;
}

interface SlotGameDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotGameId: string | null;
  slotGameName: string;
}

export default function SlotGameDetailsDialog({
  open,
  onOpenChange,
  slotGameId,
  slotGameName,
}: SlotGameDetailsDialogProps) {
  const [bonuses, setBonuses] = useState<BonusDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && slotGameId) {
      fetchBonuses();
    }
  }, [open, slotGameId]);

  const fetchBonuses = async () => {
    if (!slotGameId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/slot-games/${slotGameId}/bonuses`);
      const data = await response.json();
      
      if (response.ok) {
        setBonuses(data.bonuses);
      }
    } catch (error) {
      console.error("Error fetching bonuses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{slotGameName}</DialogTitle>
          <DialogDescription>
            All bonuses played on this slot game
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading bonuses...</div>
          </div>
        ) : bonuses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bonuses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hunt</TableHead>
                  <TableHead className="text-right">Bet Size</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead className="text-right">Multi</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell className="font-medium">{bonus.huntName}</TableCell>
                    <TableCell className="text-right">
                      ${bonus.betSize.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {bonus.payout !== null ? (
                        <span className="font-semibold text-amber-500">
                          ${bonus.payout.toFixed(2)}
                        </span>
                      ) : (
                        <Badge variant="secondary">Not opened</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {bonus.multiplier !== null ? (
                        <span
                          className={`font-semibold ${
                            bonus.multiplier >= 100
                              ? "text-green-500"
                              : bonus.multiplier >= 50
                                ? "text-amber-500"
                                : ""
                          }`}
                        >
                          {bonus.multiplier.toFixed(2)}x
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(bonus.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
