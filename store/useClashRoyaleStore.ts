import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ClashRoyaleChallengeFormatted } from '@/lib/models';

interface ClashRoyaleState {
  // Challenge data
  challenges: ClashRoyaleChallengeFormatted[];
  currentChallenge: ClashRoyaleChallengeFormatted | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  recording: boolean; // For recording wins/losses
  
  // Error and success states
  error: string | null;
  success: string | null;
  
  // Challenge form
  challengeForm: {
    name: string;
    winGoal: number;
    maxLosses: number;
  };
}

interface ClashRoyaleActions {
  // Challenge CRUD
  fetchChallenges: () => Promise<void>;
  fetchChallenge: (id: string) => Promise<void>;
  createChallenge: (challenge: { name: string; winGoal: number; maxLosses: number }) => Promise<ClashRoyaleChallengeFormatted | null>;
  updateChallenge: (challengeId: string, updates: Partial<ClashRoyaleChallengeFormatted>) => Promise<void>;
  deleteChallenge: (challengeId: string) => Promise<void>;
  
  // Game actions
  recordWin: (challengeId: string) => Promise<void>;
  recordLoss: (challengeId: string) => Promise<void>;
  resetAttempt: (challengeId: string) => Promise<void>;
  
  // Form management
  updateChallengeField: (field: string, value: any) => void;
  resetChallengeForm: () => void;
  
  // State management
  setCurrentChallenge: (challenge: ClashRoyaleChallengeFormatted | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
}

type ClashRoyaleStore = ClashRoyaleState & ClashRoyaleActions;

const initialChallengeForm = {
  name: '',
  winGoal: 20,
  maxLosses: 3,
};

const initialState: ClashRoyaleState = {
  challenges: [],
  currentChallenge: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  recording: false,
  error: null,
  success: null,
  challengeForm: initialChallengeForm,
};

export const useClashRoyaleStore = create<ClashRoyaleStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      fetchChallenges: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/clash-royale');
          const data = await response.json();
          
          if (response.ok) {
            set({
              challenges: data.challenges,
              loading: false,
            });
          } else {
            set({
              error: data.error || 'Failed to fetch challenges',
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

      fetchChallenge: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${id}`);
          const data = await response.json();
          
          if (response.ok) {
            set({
              currentChallenge: data.challenge,
              loading: false,
            });
          } else {
            set({
              error: data.error || 'Failed to fetch challenge',
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

      createChallenge: async (challengeData) => {
        set({ creating: true, error: null, success: null });
        
        try {
          const response = await fetch('/api/clash-royale', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(challengeData),
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: [data.challenge, ...state.challenges],
              creating: false,
              success: 'Challenge created successfully',
            }));
            return data.challenge;
          } else {
            set({
              error: data.error || 'Failed to create challenge',
              creating: false,
            });
            throw new Error(data.error || 'Failed to create challenge');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            creating: false,
          });
          throw err;
        }
      },

      updateChallenge: async (challengeId, updates) => {
        set({ updating: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${challengeId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: state.challenges.map(c => 
                c.id === challengeId ? data.challenge : c
              ),
              currentChallenge: state.currentChallenge?.id === challengeId 
                ? data.challenge 
                : state.currentChallenge,
              updating: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to update challenge',
              updating: false,
            });
            throw new Error(data.error || 'Failed to update challenge');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            updating: false,
          });
          throw err;
        }
      },

      deleteChallenge: async (challengeId) => {
        set({ deleting: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${challengeId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: state.challenges.filter(c => c.id !== challengeId),
              currentChallenge: state.currentChallenge?.id === challengeId 
                ? null 
                : state.currentChallenge,
              deleting: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to delete challenge',
              deleting: false,
            });
            throw new Error(data.error || 'Failed to delete challenge');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            deleting: false,
          });
          throw err;
        }
      },

      recordWin: async (challengeId) => {
        set({ recording: true, error: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${challengeId}/win`, {
            method: 'POST',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: state.challenges.map(c => 
                c.id === challengeId ? data.challenge : c
              ),
              currentChallenge: state.currentChallenge?.id === challengeId 
                ? data.challenge 
                : state.currentChallenge,
              recording: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to record win',
              recording: false,
            });
            throw new Error(data.error || 'Failed to record win');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            recording: false,
          });
          throw err;
        }
      },

      recordLoss: async (challengeId) => {
        set({ recording: true, error: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${challengeId}/lose`, {
            method: 'POST',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: state.challenges.map(c => 
                c.id === challengeId ? data.challenge : c
              ),
              currentChallenge: state.currentChallenge?.id === challengeId 
                ? data.challenge 
                : state.currentChallenge,
              recording: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to record loss',
              recording: false,
            });
            throw new Error(data.error || 'Failed to record loss');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            recording: false,
          });
          throw err;
        }
      },

      resetAttempt: async (challengeId) => {
        set({ recording: true, error: null });
        
        try {
          const response = await fetch(`/api/clash-royale/${challengeId}/reset`, {
            method: 'POST',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              challenges: state.challenges.map(c => 
                c.id === challengeId ? data.challenge : c
              ),
              currentChallenge: state.currentChallenge?.id === challengeId 
                ? data.challenge 
                : state.currentChallenge,
              recording: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to reset challenge',
              recording: false,
            });
            throw new Error(data.error || 'Failed to reset challenge');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            recording: false,
          });
          throw err;
        }
      },

      updateChallengeField: (field: string, value: any) => {
        set((state) => ({
          challengeForm: { ...state.challengeForm, [field]: value },
          success: null,
        }));
      },

      resetChallengeForm: () => {
        set({
          challengeForm: initialChallengeForm,
          error: null,
          success: null,
        });
      },

      setCurrentChallenge: (challenge: ClashRoyaleChallengeFormatted | null) => {
        set({ currentChallenge: challenge });
      },

      clearError: () => set({ error: null }),
      clearSuccess: () => set({ success: null }),
      setError: (error: string) => set({ error }),
      setSuccess: (message: string) => set({ success: message }),
    }),
    {
      name: 'clash-royale-store',
    }
  )
);

