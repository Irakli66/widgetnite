"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BonusHuntSlotFormatted } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  GripVertical,
  Trash2,
  Edit2,
  Check,
  X,
  DollarSign,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface SlotListProps {
  slots: BonusHuntSlotFormatted[];
  huntId: string;
  onUpdateSlot: (
    slotId: string,
    updates: { slotName?: string; betSize?: number; payout?: number | null; isSuper?: boolean }
  ) => Promise<void>;
  onDeleteSlot: (slotId: string) => Promise<void>;
  onReorderSlots: (newOrder: BonusHuntSlotFormatted[]) => Promise<void>;
  updating: boolean;
}

interface SortableSlotItemProps {
  slot: BonusHuntSlotFormatted;
  isEditing: boolean;
  editingPayout: string;
  updating: boolean;
  onEditPayout: (slot: BonusHuntSlotFormatted) => void;
  onSavePayout: (slotId: string) => void;
  onCancelEdit: () => void;
  onToggleSuper: (slotId: string, currentValue: boolean) => void;
  onDeleteClick: (slotId: string, slotName: string) => void;
  setEditingPayout: (value: string) => void;
}

function SortableSlotItem({
  slot,
  isEditing,
  editingPayout,
  updating,
  onEditPayout,
  onSavePayout,
  onCancelEdit,
  onToggleSuper,
  onDeleteClick,
  setEditingPayout,
}: SortableSlotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOpened = slot.payout !== null;
  const multi = isOpened ? (slot.payout! / slot.betSize).toFixed(2) : null;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isOpened ? "bg-card" : "bg-muted/50"}`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
                title="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{slot.slotName}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleSuper(slot.id, slot.isSuper || false)}
                    disabled={updating}
                    className="h-6 w-6 p-0"
                    title={slot.isSuper ? "Unmark as Super Bonus" : "Mark as Super Bonus"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        slot.isSuper
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
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
                      onClick={() => onSavePayout(slot.id)}
                      disabled={updating}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCancelEdit}
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
                      onClick={() => onEditPayout(slot)}
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
              onClick={() => onDeleteClick(slot.id, slot.slotName)}
              disabled={updating}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SlotList({
  slots,
  onUpdateSlot,
  onDeleteSlot,
  onReorderSlots,
  updating,
}: SlotListProps) {
  const [localSlots, setLocalSlots] = useState(slots);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync local state when slots prop changes from parent
  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localSlots.findIndex((slot) => slot.id === active.id);
    const newIndex = localSlots.findIndex((slot) => slot.id === over.id);

    // Update local state immediately for smooth UX
    const newOrder = arrayMove(localSlots, oldIndex, newIndex);
    setLocalSlots(newOrder);

    try {
      // Send to server only after drop
      await onReorderSlots(newOrder);
    } catch {
      // Revert on error
      setLocalSlots(slots);
      toast.error("Failed to reorder slots");
    }
  };

  const handleToggleSuper = async (slotId: string, currentValue: boolean) => {
    try {
      await onUpdateSlot(slotId, { isSuper: !currentValue });
      toast.success(!currentValue ? "Marked as Super Bonus!" : "Unmarked as Super Bonus");
    } catch {
      toast.error("Failed to update super status");
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2 relative">
        {updating && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Updating slots...</p>
            </div>
          </div>
        )}
        <SortableContext
          items={localSlots.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {localSlots.map((slot) => (
              <SortableSlotItem
                key={slot.id}
                slot={slot}
                isEditing={editingSlotId === slot.id}
                editingPayout={editingPayout}
                updating={updating}
                onEditPayout={handleEditPayout}
                onSavePayout={handleSavePayout}
                onCancelEdit={handleCancelEdit}
                onToggleSuper={handleToggleSuper}
                onDeleteClick={handleDeleteClick}
                setEditingPayout={setEditingPayout}
              />
            ))}
          </div>
        </SortableContext>
      </div>

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
    </DndContext>
  );
}
