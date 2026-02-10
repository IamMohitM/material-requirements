import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vendorsApi } from '../../services/vendorsApi';

export interface VendorRate {
  material_id: string;
  material_name: string;
  price: number;
  unit: string;
  updated_at: string;
}

export interface VendorRateHistory {
  id: string;
  material_id: string;
  vendor_id: string;
  price_old: number;
  price_new: number;
  change_percentage: number;
  effective_date: string;
  reason?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  rating?: number;
  is_active: boolean;
  payment_terms?: string;
  delivery_lead_time_days?: number;
  specialties?: string[];
  rates?: VendorRate[];
  rate_history?: VendorRateHistory[];
  created_at: string;
  updated_at: string;
}

export interface VendorFilters {
  searchTerm?: string;
  isActive?: boolean;
  rating?: number;
}

interface VendorsState {
  list: Vendor[];
  detail: Vendor | null;
  filters: VendorFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: VendorsState = {
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
};

export const fetchVendors = createAsyncThunk(
  'vendors/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: VendorFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await vendorsApi.listVendors(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch vendors');
    }
  }
);

export const fetchVendorDetail = createAsyncThunk(
  'vendors/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await vendorsApi.getVendor(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch vendor');
    }
  }
);

export const createVendor = createAsyncThunk(
  'vendors/create',
  async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await vendorsApi.createVendor(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create vendor');
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/update',
  async ({ id, data }: { id: string; data: Partial<Vendor> }, { rejectWithValue }) => {
    try {
      return await vendorsApi.updateVendor(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update vendor');
    }
  }
);

export const fetchVendorRateHistory = createAsyncThunk(
  'vendors/fetchRateHistory',
  async (id: string, { rejectWithValue }) => {
    try {
      return await vendorsApi.getRateHistory(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rate history');
    }
  }
);

export const updateVendorRates = createAsyncThunk(
  'vendors/updateRates',
  async ({ id, rates }: { id: string; rates: VendorRate[] }, { rejectWithValue }) => {
    try {
      return await vendorsApi.updateRates(id, rates);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update rates');
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await vendorsApi.deleteVendor(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete vendor');
    }
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<VendorFilters>) => {
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
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchVendorDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchVendorDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createVendor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateVendor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchVendorRateHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorRateHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.detail) {
          state.detail.rate_history = action.payload;
        }
      })
      .addCase(fetchVendorRateHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateVendorRates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVendorRates.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.detail) {
          state.detail = action.payload;
        }
      })
      .addCase(updateVendorRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteVendor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((v) => v.id !== action.payload);
        if (state.detail?.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, setPage } = vendorsSlice.actions;
export default vendorsSlice.reducer;
