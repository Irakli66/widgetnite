"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EndHuntDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult: (result: "profit" | "no_profit") => void;
  loading?: boolean;
}

export default function EndHuntDialog({
  open,
  onOpenChange,
  onSelectResult,
  loading = false,
}: EndHuntDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">How did the hunt go?</DialogTitle>
          <DialogDescription>
            Select the outcome of your bonus hunt
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-3 pt-4">
          <Button
            onClick={() => onSelectResult("profit")}
            disabled={loading}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Profit
          </Button>
          <Button
            onClick={() => onSelectResult("no_profit")}
            disabled={loading}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            <TrendingDown className="h-5 w-5 mr-2" />
            No Profit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
