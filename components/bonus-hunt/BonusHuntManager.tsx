"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBonusHuntStore } from "@/store/useBonusHuntStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, DollarSign, Edit2, Check, X, Play, StopCircle } from "lucide-react";
import { toast } from "sonner";
import HuntStats from "./HuntStats";
import SlotList from "./SlotList";
import EndHuntDialog from "./EndHuntDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BonusHuntManagerProps {
  huntId: string;
}

export default function BonusHuntManager({ huntId }: BonusHuntManagerProps) {
  const router = useRouter();
  const {
    currentHunt,
    loading,
    updating,
    slotsLoading,
    error,
    slotForm,
    fetchHunt,
    updateHunt,
    addSlot,
    updateSlot,
    deleteSlot,
    reorderSlot,
    startHunt,
    endHunt,
    updateSlotField,
    resetSlotForm,
    clearError,
  } = useBonusHuntStore();

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceValue, setBalanceValue] = useState("");
  const [showEndHuntDialog, setShowEndHuntDialog] = useState(false);

  useEffect(() => {
    fetchHunt(huntId);
  }, [huntId, fetchHunt]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleAddSlot = async () => {
    if (!slotForm.slotName || slotForm.betSize <= 0) {
      toast.error("Please enter a valid slot name and bet size");
      return;
    }

    try {
      await addSlot(huntId, {
        slotName: slotForm.slotName,
        betSize: slotForm.betSize,
      });
      toast.success("Slot added!");
      resetSlotForm();
      setShowAddSlot(false);
    } catch {
      toast.error("Failed to add slot");
    }
  };

  const handleEditBalance = () => {
    setBalanceValue(currentHunt?.startBalance.toString() || "");
    setEditingBalance(true);
  };

  const handleSaveBalance = async () => {
    const newBalance = parseFloat(balanceValue);
    if (isNaN(newBalance) || newBalance <= 0) {
      toast.error("Please enter a valid balance");
      return;
    }

    try {
      await updateHunt(huntId, { startBalance: newBalance });
      setEditingBalance(false);
      toast.success("Start balance updated!");
    } catch {
      toast.error("Failed to update balance");
    }
  };

  const handleUpdateSlot = async (
    slotId: string,
    updates: { slotName?: string; betSize?: number; payout?: number | null }
  ) => {
    await updateSlot(huntId, slotId, updates);
  };

  const handleDeleteSlot = async (slotId: string) => {
    await deleteSlot(huntId, slotId);
  };

  const handleReorderSlot = async (
    slotId: string,
    direction: "up" | "down",
  ) => {
    await reorderSlot(huntId, slotId, direction);
  };

  const handleStartHunt = async () => {
    try {
      await startHunt(huntId);
      toast.success("Hunt started!");
    } catch {
      toast.error("Failed to start hunt");
    }
  };

  const handleEndHunt = async (result: "profit" | "no_profit") => {
    try {
      await endHunt(huntId, result);
      toast.success(`Hunt ended - ${result === "profit" ? "Profit!" : "No Profit"}`);
      setShowEndHuntDialog(false);
    } catch {
      toast.error("Failed to end hunt");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading hunt...</div>
      </div>
    );
  }

  if (!currentHunt) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Hunt not found</h3>
          <Button onClick={() => router.push("/dashboard/bonus-hunt")}>
            Back to Hunts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/bonus-hunt")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{currentHunt.name}</h1>
          {currentHunt.status === "ended" && (
            <Badge
              variant={currentHunt.huntResult === "profit" ? "default" : "secondary"}
              className={currentHunt.huntResult === "profit" ? "bg-green-600" : ""}
            >
              {currentHunt.huntResult === "profit" ? "Profit" : "No Profit"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentHunt.status === "not_started" && (
            <Button onClick={handleStartHunt} disabled={updating} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Hunt
            </Button>
          )}
          {currentHunt.status === "in_progress" && (
            <Button 
              onClick={() => setShowEndHuntDialog(true)} 
              disabled={updating} 
              size="sm"
              variant="destructive"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              End Hunt
            </Button>
          )}
          {editingBalance ? (
            <>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  value={balanceValue}
                  onChange={(e) => setBalanceValue(e.target.value)}
                  className="w-32"
                  autoFocus
                />
              </div>
              <Button size="sm" onClick={handleSaveBalance} disabled={updating}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingBalance(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Start Balance
                </div>
                <div className="text-xl font-bold">
                  ${currentHunt.startBalance.toFixed(2)}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={handleEditBalance}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <HuntStats
        startBalance={currentHunt.startBalance}
        slots={currentHunt.slots}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bonus Slots</CardTitle>
            <Button onClick={() => setShowAddSlot(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SlotList
            slots={currentHunt.slots}
            huntId={huntId}
            onUpdateSlot={handleUpdateSlot}
            onDeleteSlot={handleDeleteSlot}
            onReorderSlot={handleReorderSlot}
            updating={slotsLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bonus Slot</DialogTitle>
            <DialogDescription>
              Enter the slot name and bet size for this bonus
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slotName">Slot Name</Label>
              <Input
                id="slotName"
                placeholder="e.g., Gates of Olympus"
                value={slotForm.slotName}
                onChange={(e) => updateSlotField("slotName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="betSize">Bet Size ($)</Label>
              <Input
                id="betSize"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={slotForm.betSize || ""}
                onChange={(e) =>
                  updateSlotField("betSize", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddSlot(false);
                resetSlotForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddSlot} disabled={slotsLoading}>
              {slotsLoading ? "Adding..." : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EndHuntDialog
        open={showEndHuntDialog}
        onOpenChange={setShowEndHuntDialog}
        onSelectResult={handleEndHunt}
        loading={updating}
      />
    </div>
  );
}
