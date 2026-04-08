import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BonusHuntFormatted, BonusHuntSlotFormatted, BonusHuntWithSlots } from '@/lib/models';

interface BonusHuntState {
  hunts: BonusHuntFormatted[];
  currentHunt: BonusHuntWithSlots | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  slotsLoading: boolean;
  error: string | null;
  success: string | null;
  huntForm: {
    name: string;
    startBalance: number;
  };
  slotForm: {
    slotName: string;
    betSize: number;
  };
}

interface BonusHuntActions {
  fetchHunts: () => Promise<void>;
  fetchHunt: (id: string) => Promise<void>;
  createHunt: (hunt: { name: string; startBalance: number }) => Promise<BonusHuntFormatted | null>;
  updateHunt: (huntId: string, updates: { name?: string; startBalance?: number }) => Promise<void>;
  deleteHunt: (huntId: string) => Promise<void>;
  startHunt: (huntId: string) => Promise<void>;
  endHunt: (huntId: string, result: 'profit' | 'no_profit') => Promise<void>;
  
  addSlot: (huntId: string, slot: { slotName: string; betSize: number; slotGameId?: string | null }) => Promise<void>;
  updateSlot: (huntId: string, slotId: string, updates: { slotName?: string; betSize?: number; payout?: number | null; isSuper?: boolean }) => Promise<void>;
  deleteSlot: (huntId: string, slotId: string) => Promise<void>;
  reorderSlot: (huntId: string, slotId: string, direction: 'up' | 'down') => Promise<void>;
  
  updateHuntField: (field: keyof BonusHuntState['huntForm'], value: string | number) => void;
  updateSlotField: (field: keyof BonusHuntState['slotForm'], value: string | number) => void;
  resetHuntForm: () => void;
  resetSlotForm: () => void;
  
  setCurrentHunt: (hunt: BonusHuntWithSlots | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
}

type BonusHuntStore = BonusHuntState & BonusHuntActions;

const initialHuntForm = {
  name: '',
  startBalance: 500,
};

const initialSlotForm = {
  slotName: '',
  betSize: 0,
};

const initialState: BonusHuntState = {
  hunts: [],
  currentHunt: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  slotsLoading: false,
  error: null,
  success: null,
  huntForm: initialHuntForm,
  slotForm: initialSlotForm,
};

export const useBonusHuntStore = create<BonusHuntStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchHunts: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/bonus-hunt');
          const data = await response.json();
          
          if (response.ok) {
            set({
              hunts: data.hunts,
              loading: false,
            });
          } else {
            set({
              error: data.error || 'Failed to fetch hunts',
              loading: false,
            });
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            loading: false,
          });
        }
      },

      fetchHunt: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${id}`);
          const data = await response.json();
          
          if (response.ok) {
            set({
              currentHunt: data.hunt,
              loading: false,
            });
          } else {
            set({
              error: data.error || 'Failed to fetch hunt',
              loading: false,
            });
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            loading: false,
          });
        }
      },

      createHunt: async (huntData) => {
        set({ creating: true, error: null, success: null });
        
        try {
          const response = await fetch('/api/bonus-hunt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(huntData),
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              hunts: [data.hunt, ...state.hunts],
              creating: false,
              success: 'Hunt created successfully',
            }));
            return data.hunt;
          } else {
            set({
              error: data.error || 'Failed to create hunt',
              creating: false,
            });
            throw new Error(data.error || 'Failed to create hunt');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            creating: false,
          });
          throw err;
        }
      },

      updateHunt: async (huntId, updates) => {
        set({ updating: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          if (response.ok) {
            const data = await response.json();
            // Refetch the hunt to get the latest data
            await get().fetchHunt(huntId);
            // Also update the hunts list if needed
            set((state) => ({
              hunts: state.hunts.map(h => 
                h.id === huntId ? data.hunt : h
              ),
              updating: false,
            }));
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to update hunt',
              updating: false,
            });
            throw new Error(data.error || 'Failed to update hunt');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to update hunt') {
            set({
              error: 'Network error occurred',
              updating: false,
            });
          }
          throw err;
        }
      },

      deleteHunt: async (huntId) => {
        set({ deleting: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              hunts: state.hunts.filter(h => h.id !== huntId),
              currentHunt: state.currentHunt?.id === huntId 
                ? null 
                : state.currentHunt,
              deleting: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to delete hunt',
              deleting: false,
            });
            throw new Error(data.error || 'Failed to delete hunt');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            deleting: false,
          });
          throw err;
        }
      },

      startHunt: async (huntId) => {
        set({ updating: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/start`, {
            method: 'PATCH',
          });

          if (response.ok) {
            await get().fetchHunt(huntId);
            set({ updating: false, success: 'Hunt started!' });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to start hunt',
              updating: false,
            });
            throw new Error(data.error || 'Failed to start hunt');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to start hunt') {
            set({
              error: 'Network error occurred',
              updating: false,
            });
          }
          throw err;
        }
      },

      endHunt: async (huntId, result) => {
        set({ updating: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/end`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ result }),
          });

          if (response.ok) {
            await get().fetchHunt(huntId);
            set({ updating: false, success: 'Hunt ended!' });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to end hunt',
              updating: false,
            });
            throw new Error(data.error || 'Failed to end hunt');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to end hunt') {
            set({
              error: 'Network error occurred',
              updating: false,
            });
          }
          throw err;
        }
      },

      addSlot: async (huntId, slotData) => {
        set({ slotsLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/slots`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(slotData),
          });

          if (response.ok) {
            // Refetch the entire hunt to get updated slots with correct positions
            await get().fetchHunt(huntId);
            set({ slotsLoading: false });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to add slot',
              slotsLoading: false,
            });
            throw new Error(data.error || 'Failed to add slot');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to add slot') {
            set({
              error: 'Network error occurred',
              slotsLoading: false,
            });
          }
          throw err;
        }
      },

      updateSlot: async (huntId, slotId, updates) => {
        set({ slotsLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/slots/${slotId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          if (response.ok) {
            // Refetch the entire hunt to get the latest data
            await get().fetchHunt(huntId);
            set({ slotsLoading: false });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to update slot',
              slotsLoading: false,
            });
            throw new Error(data.error || 'Failed to update slot');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to update slot') {
            set({
              error: 'Network error occurred',
              slotsLoading: false,
            });
          }
          throw err;
        }
      },

      deleteSlot: async (huntId, slotId) => {
        set({ slotsLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/slots/${slotId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // Refetch the entire hunt to get updated positions
            await get().fetchHunt(huntId);
            set({ slotsLoading: false });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to delete slot',
              slotsLoading: false,
            });
            throw new Error(data.error || 'Failed to delete slot');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to delete slot') {
            set({
              error: 'Network error occurred',
              slotsLoading: false,
            });
          }
          throw err;
        }
      },

      reorderSlot: async (huntId, slotId, direction) => {
        set({ slotsLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/bonus-hunt/${huntId}/slots/reorder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slotId, direction }),
          });

          if (response.ok) {
            await get().fetchHunt(huntId);
            set({ slotsLoading: false });
          } else {
            const data = await response.json();
            set({
              error: data.error || 'Failed to reorder slot',
              slotsLoading: false,
            });
            throw new Error(data.error || 'Failed to reorder slot');
          }
        } catch (err) {
          if (err instanceof Error && err.message !== 'Failed to reorder slot') {
            set({
              error: 'Network error occurred',
              slotsLoading: false,
            });
          }
          throw err;
        }
      },

      updateHuntField: (field, value) => {
        set((state) => ({
          huntForm: { ...state.huntForm, [field]: value },
          success: null,
        }));
      },

      updateSlotField: (field, value) => {
        set((state) => ({
          slotForm: { ...state.slotForm, [field]: value },
        }));
      },

      resetHuntForm: () => {
        set({
          huntForm: initialHuntForm,
          error: null,
          success: null,
        });
      },

      resetSlotForm: () => {
        set({
          slotForm: initialSlotForm,
        });
      },

      setCurrentHunt: (hunt: BonusHuntWithSlots | null) => {
        set({ currentHunt: hunt });
      },

      clearError: () => set({ error: null }),
      clearSuccess: () => set({ success: null }),
      setError: (error: string) => set({ error }),
      setSuccess: (message: string) => set({ success: message }),
    }),
    {
      name: 'bonus-hunt-store',
    }
  )
);
