import { NextRequest } from "next/server";
import db from "@/lib/db";
import { BonusHuntSlotFormatted } from "@/lib/models";

export const dynamic = 'force-dynamic';

// SSE stream is public - no auth required for OBS widget updates
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let interval: NodeJS.Timeout | null = null;
      let isClosed = false;
      let isCleaningUp = false;

      const cleanup = () => {
        if (isCleaningUp) return;
        isCleaningUp = true;

        // Clear interval first to stop any pending callbacks
        if (interval) {
          clearInterval(interval);
          interval = null;
        }

        // Then close the controller
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch {
            // Controller already closed, ignore
          }
        }
      };

      const sendUpdate = async () => {
        // Early exit if already closed or cleaning up
        if (isClosed || isCleaningUp) return;

        try {
          const hunt = await db
            .selectFrom("bonus_hunts")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();

          if (!hunt) {
            cleanup();
            return;
          }

          // Check again after async operation
          if (isClosed || isCleaningUp) return;

          const huntCountResult = await db
            .selectFrom("bonus_hunts")
            .select(db.fn.count("id").as("count"))
            .where("user_id", "=", hunt.user_id)
            .where("created_at", "<=", hunt.created_at!)
            .executeTakeFirst();

          const huntNumber = Number(huntCountResult?.count || 1);

          const slots = await db
            .selectFrom("bonus_hunt_slots")
            .selectAll()
            .where("hunt_id", "=", id)
            .orderBy("position", "asc")
            .execute();

          const transformedSlots: BonusHuntSlotFormatted[] = slots.map((s) => ({
            id: s.id!,
            huntId: s.hunt_id,
            slotName: s.slot_name,
            betSize: Number(s.bet_size),
            payout: s.payout ? Number(s.payout) : null,
            position: s.position,
            slotGameId: s.slot_game_id,
            isSuper: s.is_super || false,
            createdAt: s.created_at!,
            updatedAt: s.updated_at!,
          }));

          const huntData = {
            id: hunt.id!,
            userId: hunt.user_id,
            name: hunt.name,
            startBalance: Number(hunt.start_balance),
            status: hunt.status || 'not_started',
            currentSlotIndex: hunt.current_slot_index,
            huntResult: hunt.hunt_result,
            createdAt: hunt.created_at!,
            updatedAt: hunt.updated_at!,
            slots: transformedSlots,
            huntNumber,
          };

          // Final check before enqueueing
          if (!isClosed && !isCleaningUp) {
            const data = `data: ${JSON.stringify(huntData)}\n\n`;
            try {
              controller.enqueue(encoder.encode(data));
            } catch {
              // Controller closed during enqueue, cleanup
              cleanup();
            }
          }
        } catch {
          // Stop the stream on any error
          cleanup();
        }
      };

      // Send initial data
      await sendUpdate();

      // Only start interval if still open after initial send
      if (!isClosed && !isCleaningUp) {
        interval = setInterval(sendUpdate, 3000);
      }

      // Cleanup on close
      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
