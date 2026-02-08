import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { deliveriesApi } from '../../services/deliveriesApi';

export interface DeliveryLineItem {
  material_id: string;
  material_name: string;
  quantity_ordered: number;
  good_qty: number;
  damaged_qty: number;
  unit_price: number;
  brand_ordered?: string;
  brand_received?: string;
  damage_notes?: string;
}

export interface Delivery {
  id: string;
  po_id: string;
  delivery_number: string;
  delivery_date: string;
  received_by_id: string;
  delivery_location: string;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE';
  quality_score: number;
  line_items: DeliveryLineItem[];
  created_at: string;
  updated_at: string;
}

export interface DeliveryFilters {
  poId?: string;
  status?: 'PENDING' | 'PARTIAL' | 'COMPLETE';
  dateRange?: [string, string];
  searchTerm?: string;
}

interface DeliveriesState {
  list: Delivery[];
  detail: Delivery | null;
  filters: DeliveryFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
  selectedDeliveries: string[];
}

const initialState: DeliveriesState = {
  list: [],
  detail: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
  selectedDeliveries: [],
};

export const fetchDeliveries = createAsyncThunk(
  'deliveries/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: DeliveryFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await deliveriesApi.listDeliveries(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch deliveries');
    }
  }
);

export const fetchDeliveryDetail = createAsyncThunk(
  'deliveries/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deliveriesApi.getDelivery(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch delivery');
    }
  }
);

export const createDelivery = createAsyncThunk(
  'deliveries/create',
  async (data: Omit<Delivery, 'id' | 'delivery_number' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await deliveriesApi.createDelivery(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create delivery');
    }
  }
);

export const updateDelivery = createAsyncThunk(
  'deliveries/update',
  async ({ id, data }: { id: string; data: Partial<Delivery> }, { rejectWithValue }) => {
    try {
      return await deliveriesApi.updateDelivery(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update delivery');
    }
  }
);

export const completeDelivery = createAsyncThunk(
  'deliveries/complete',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deliveriesApi.completeDelivery(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete delivery');
    }
  }
);

export const deleteDelivery = createAsyncThunk(
  'deliveries/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deliveriesApi.deleteDelivery(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete delivery');
    }
  }
);

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<DeliveryFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchDeliveryDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchDeliveryDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(completeDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(completeDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((d) => d.id !== action.payload);
        if (state.detail?.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deleteDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, setPage } = deliveriesSlice.actions;
export default deliveriesSlice.reducer;
