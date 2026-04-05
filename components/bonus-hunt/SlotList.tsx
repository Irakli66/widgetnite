"use client";

import { useState } from "react";
import { BonusHuntSlotFormatted } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  Check,
  X,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface SlotListProps {
  slots: BonusHuntSlotFormatted[];
  huntId: string;
  onUpdateSlot: (
    slotId: string,
    updates: { slotName?: string; betSize?: number; payout?: number | null }
  ) => Promise<void>;
  onDeleteSlot: (slotId: string) => Promise<void>;
  onReorderSlot: (slotId: string, direction: "up" | "down") => Promise<void>;
  updating: boolean;
}

export default function SlotList({
  slots,

  onUpdateSlot,
  onDeleteSlot,
  onReorderSlot,
  updating,
}: SlotListProps) {
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingPayout, setEditingPayout] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    slotId: string;
    slotName: string;
  }>({
    open: false,
    slotId: "",
    slotName: "",
  });

  const handleEditPayout = (slot: BonusHuntSlotFormatted) => {
    setEditingSlotId(slot.id);
    setEditingPayout(slot.payout?.toString() || "");
  };

  const handleSavePayout = async (slotId: string) => {
    try {
      const payoutValue = parseFloat(editingPayout);
      if (isNaN(payoutValue) || payoutValue < 0) {
        toast.error("Please enter a valid payout amount");
        return;
      }

      await onUpdateSlot(slotId, { payout: payoutValue });
      setEditingSlotId(null);
      setEditingPayout("");
      toast.success("Payout updated!");
    } catch {
      toast.error("Failed to update payout");
    }
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditingPayout("");
  };

  const handleDeleteClick = (slotId: string, slotName: string) => {
    setConfirmDelete({
      open: true,
      slotId,
      slotName,
    });
  };

  const confirmDeleteSlot = async () => {
    try {
      await onDeleteSlot(confirmDelete.slotId);
      setConfirmDelete({ open: false, slotId: "", slotName: "" });
      toast.success("Slot deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete slot");
    }
  };

  const handleReorder = async (slotId: string, direction: "up" | "down") => {
    try {
      await onReorderSlot(slotId, direction);
    } catch {
      toast.error(`Cannot move ${direction}`);
    }
  };

  if (slots.length === 0) {
    return (
      <Card className="relative">
        {updating && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Updating slots...</p>
            </div>
          </div>
        )}
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No slots added yet. Add your first bonus!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 relative">
      {updating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Updating slots...</p>
          </div>
        </div>
      )}
      {slots.map((slot, index) => {
        const isEditing = editingSlotId === slot.id;
        const isOpened = slot.payout !== null;
        const multi = isOpened
          ? (slot.payout! / slot.betSize).toFixed(2)
          : null;

        return (
          <Card
            key={slot.id}
            className={`${isOpened ? "bg-card" : "bg-muted/50"}`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(slot.id, "up")}
                      disabled={index === 0 || updating}
                      className="h-5 w-5 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorder(slot.id, "down")}
                      disabled={index === slots.length - 1 || updating}
                      className="h-5 w-5 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{slot.slotName}</div>
                    <div className="text-sm text-muted-foreground">
                      Bet: ${slot.betSize.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            value={editingPayout}
                            onChange={(e) => setEditingPayout(e.target.value)}
                            className="w-24 h-8"
                            placeholder="0.00"
                            autoFocus
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSavePayout(slot.id)}
                          disabled={updating}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-right min-w-[100px]">
                          {isOpened ? (
                            <>
                              <div className="font-bold text-primary">
                                ${slot.payout!.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {multi}x
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Not opened
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPayout(slot)}
                          disabled={updating}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(slot.id, slot.slotName)}
                  disabled={updating}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
        title="Delete Slot"
        description={`Are you sure you want to delete "${confirmDelete.slotName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={updating}
        onConfirm={confirmDeleteSlot}
      />
    </div>
  );
}
