import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  notification: {
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string;
  };
  isLoading: boolean;
  currentProject: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  notification: {
    type: null,
    message: '',
  },
  isLoading: false,
  currentProject: localStorage.getItem('currentProject') || null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showNotification: (
      state,
      action: PayloadAction<{ type: 'success' | 'error' | 'warning' | 'info'; message: string }>
    ) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = { type: null, message: '' };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<string>) => {
      state.currentProject = action.payload;
      localStorage.setItem('currentProject', action.payload);
    },
  },
});

export const {
  toggleSidebar,
  showNotification,
  clearNotification,
  setLoading,
  setCurrentProject,
} = uiSlice.actions;

export default uiSlice.reducer;
