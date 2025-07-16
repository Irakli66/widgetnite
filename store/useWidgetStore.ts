import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Widget, WidgetFormatted } from '@/lib/models';

interface WidgetState {
  // Widget data
  widgets: WidgetFormatted[];
  currentWidget: WidgetFormatted | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error and success states
  error: string | null;
  success: string | null;
  
  // Widget customization form
  customizationForm: {
    name: string;
    compact: boolean;
    colorTheme: 'blue' | 'violet' | 'green' | 'red';
    showProfile: boolean;
    faceitUsername: string;
  };
}

interface WidgetActions {
  // Widget CRUD
  fetchWidgets: () => Promise<void>;
  createWidget: (widget: Omit<WidgetFormatted, 'id' | 'userId' | 'created_at' | 'updated_at' | 'widgetUrl'>) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<WidgetFormatted>) => Promise<void>;
  deleteWidget: (widgetId: string) => Promise<void>;
  
  // Customization form management
  updateCustomizationField: (field: string, value: any) => void;
  resetCustomizationForm: () => void;
  setCustomizationFromWidget: (widget: WidgetFormatted) => void;
  
  // Widget generation
  generateWidgetUrl: () => string;
  
  // State management
  setCurrentWidget: (widget: Widget | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  setError: (error: string) => void;
  setSuccess: (message: string) => void;
}

type WidgetStore = WidgetState & WidgetActions;

const initialCustomizationForm = {
  name: '',
  compact: false,
  colorTheme: 'blue' as const,
  showProfile: true,
  faceitUsername: '',
};

const initialState: WidgetState = {
  widgets: [],
  currentWidget: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: null,
  customizationForm: initialCustomizationForm,
};

export const useWidgetStore = create<WidgetStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      fetchWidgets: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch('/api/widgets');
          const data = await response.json();
          
          if (response.ok) {
            set({
              widgets: data.widgets,
              loading: false,
            });
          } else {
            set({
              error: data.error || 'Failed to fetch widgets',
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

      createWidget: async (widgetData) => {
        set({ creating: true, error: null, success: null });
        
        try {
          // Map WidgetFormatted to API format
          const apiData = {
            name: widgetData.name,
            compact: widgetData.compact,
            colorTheme: widgetData.colorTheme,
            showProfile: widgetData.showProfile,
            faceitUsername: widgetData.faceitUsername,
          };
          
          const response = await fetch('/api/widgets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              widgets: [...state.widgets, data.widget],
              creating: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to create widget',
              creating: false,
            });
            throw new Error(data.error || 'Failed to create widget');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            creating: false,
          });
          throw err;
        }
      },

      updateWidget: async (widgetId, updates) => {
        set({ updating: true, error: null, success: null });
        
        try {
          // Map WidgetFormatted to API format
          const apiUpdates: any = {};
          if (updates.name !== undefined) apiUpdates.name = updates.name;
          if (updates.compact !== undefined) apiUpdates.compact = updates.compact;
          if (updates.colorTheme !== undefined) apiUpdates.colorTheme = updates.colorTheme;
          if (updates.showProfile !== undefined) apiUpdates.showProfile = updates.showProfile;
          if (updates.faceitUsername !== undefined) apiUpdates.faceitUsername = updates.faceitUsername;
          
          const response = await fetch(`/api/widgets/${widgetId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiUpdates),
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              widgets: state.widgets.map(w => 
                w.id === widgetId ? data.widget : w
              ),
              currentWidget: state.currentWidget?.id === widgetId ? data.widget : state.currentWidget,
              updating: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to update widget',
              updating: false,
            });
            throw new Error(data.error || 'Failed to update widget');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            updating: false,
          });
          throw err;
        }
      },

      deleteWidget: async (widgetId) => {
        set({ deleting: true, error: null, success: null });
        
        try {
          const response = await fetch(`/api/widgets/${widgetId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (response.ok) {
            set((state) => ({
              widgets: state.widgets.filter(w => w.id !== widgetId),
              currentWidget: state.currentWidget?.id === widgetId ? null : state.currentWidget,
              deleting: false,
            }));
          } else {
            set({
              error: data.error || 'Failed to delete widget',
              deleting: false,
            });
            throw new Error(data.error || 'Failed to delete widget');
          }
        } catch (err) {
          set({
            error: 'Network error occurred',
            deleting: false,
          });
          throw err;
        }
      },

      updateCustomizationField: (field: string, value: any) => {
        set((state) => ({
          customizationForm: { ...state.customizationForm, [field]: value },
          success: null,
        }));
      },

      resetCustomizationForm: () => {
        set({
          customizationForm: initialCustomizationForm,
          error: null,
          success: null,
        });
      },

      setCustomizationFromWidget: (widget: WidgetFormatted) => {
        set({
          customizationForm: {
            name: widget.name,
            compact: widget.compact,
            colorTheme: widget.colorTheme,
            showProfile: widget.showProfile,
            faceitUsername: widget.faceitUsername || '',
          },
        });
      },

      generateWidgetUrl: () => {
        const { customizationForm } = get();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const params = new URLSearchParams({
          username: customizationForm.faceitUsername,
          compact: customizationForm.compact.toString(),
          theme: customizationForm.colorTheme,
          showProfile: customizationForm.showProfile.toString(),
        });
        
        return `${baseUrl}/widget/faceit-stats?${params.toString()}`;
      },

      setCurrentWidget: (widget: WidgetFormatted | null) => {
        set({ currentWidget: widget });
      },

      clearError: () => set({ error: null }),
      clearSuccess: () => set({ success: null }),
      setError: (error: string) => set({ error }),
      setSuccess: (message: string) => set({ success: message }),
    }),
    {
      name: 'widget-store',
    }
  )
); 