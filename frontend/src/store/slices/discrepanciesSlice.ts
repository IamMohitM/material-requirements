import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Discrepancy {
  id: string;
  po_id: string;
  invoice_id?: string;
  delivery_id?: string;
  type: 'QUANTITY_MISMATCH' | 'PRICE_MISMATCH' | 'BRAND_MISMATCH' | 'TIMING_MISMATCH' | 'QUALITY_ISSUE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'WAIVED';
  description: string;
  created_by_id: string;
  created_at: string;
  resolved_by_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

interface DiscrepanciesState {
  list: Discrepancy[];
  detail: Discrepancy | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    critical: number;
    warning: number;
    info: number;
  };
}

const initialState: DiscrepanciesState = {
  list: [],
  detail: null,
  isLoading: false,
  error: null,
  stats: {
    critical: 0,
    warning: 0,
    info: 0,
  },
};

export const fetchDiscrepancies = createAsyncThunk(
  'discrepancies/fetchList',
  async (
    _params: {
      poId?: string;
      severity?: string;
      status?: string;
    }
  ) => {
    // API call would go here
    return { data: [], total: 0 };
  }
);

const discrepanciesSlice = createSlice({
  name: 'discrepancies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscrepancies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscrepancies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        // Calculate stats
        state.stats.critical = state.list.filter((d) => d.severity === 'CRITICAL').length;
        state.stats.warning = state.list.filter((d) => d.severity === 'WARNING').length;
        state.stats.info = state.list.filter((d) => d.severity === 'INFO').length;
      })
      .addCase(fetchDiscrepancies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = discrepanciesSlice.actions;
export default discrepanciesSlice.reducer;
