import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/lib/models';

interface ProfileState {
  // User data
  userData: User | null;
  
  // Loading states
  loading: boolean;
  updating: boolean;
  
  // Error and success states
  error: string | null;
  success: string | null;
  
  // Form data (separate from saved data for change tracking)
  formData: {
    faceit: string;
    faceitId: string;
    twitch: string;
    kick: string;
  };

  // Track if form has been initialized with user data
  formInitialized: boolean;
}

interface ProfileActions {
  // Data fetching
  fetchUserData: () => Promise<void>;
  
  // Form management
  updateFormField: (field: string, value: string) => void;
  resetForm: () => void;
  initializeForm: (userData: User) => void;
  
  // Data updating
  updateProfile: () => Promise<void>;
  
  // State management
  clearError: () => void;
  clearSuccess: () => void;
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
  
  // Utility
  hasChanges: () => boolean;
}

type ProfileStore = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userData: null,
        loading: false,
        updating: false,
        error: null,
        success: null,
        formData: {
          faceit: '',
          faceitId: '',
          twitch: '',
          kick: '',
        },
        formInitialized: false,

        // Actions
        fetchUserData: async () => {
          set({ loading: true, error: null });
          
          try {
            const response = await fetch('/api/me/get');
            const data = await response.json();
            
            if (response.ok) {
              const userData = data.user;
              const formData = {
                faceit: userData.faceit || '',
                faceitId: userData.faceitId || '',
                twitch: userData.twitch || '',
                kick: userData.kick || '',
              };
              
              set({
                userData,
                formData,
                formInitialized: true,
                loading: false,
              });
            } else {
              set({
                error: data.error || 'Failed to fetch user data',
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

        initializeForm: (userData: User) => {
          if (!get().formInitialized) {
            set({
              formData: {
                faceit: userData.faceit || '',
                faceitId: userData.faceitId || '',
                twitch: userData.twitch || '',
                kick: userData.kick || '',
              },
              formInitialized: true,
            });
          }
        },

        updateFormField: (field: string, value: string) => {
          set((state) => ({
            formData: { ...state.formData, [field]: value },
            success: null, // Clear success message when user starts typing
          }));
        },

        resetForm: () => {
          const { userData } = get();
          if (userData) {
            set({
              formData: {
                faceit: userData.faceit || '',
                faceitId: userData.faceitId || '',
                twitch: userData.twitch || '',
                kick: userData.kick || '',
              },
              success: null,
              error: null,
            });
          }
        },

        updateProfile: async () => {
          const { formData } = get();
          set({ updating: true, error: null, success: null });

          try {
            const response = await fetch('/api/me/update', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
              set({
                userData: data.user,
                success: data.message || 'Profile updated successfully!',
                updating: false,
              });
            } else {
              set({
                error: data.error || 'Failed to update profile',
                updating: false,
              });
            }
          } catch (err) {
            set({
              error: 'Network error occurred',
              updating: false,
            });
          }
        },

        clearError: () => set({ error: null }),
        clearSuccess: () => set({ success: null }),
        setError: (error: string) => set({ error }),
        setSuccess: (message: string) => set({ success: message }),

        hasChanges: () => {
          const { userData, formData } = get();
          if (!userData) return false;
          
          return (
            formData.faceit !== (userData.faceit || '') ||
            formData.faceitId !== (userData.faceitId || '') ||
            formData.twitch !== (userData.twitch || '') ||
            formData.kick !== (userData.kick || '')
          );
        },
      }),
      {
        name: 'profile-store',
        // Only persist user data, not loading states or form data
        partialize: (state) => ({ userData: state.userData }),
      }
    ),
    {
      name: 'profile-store',
    }
  )
);
