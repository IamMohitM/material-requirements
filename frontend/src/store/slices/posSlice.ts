import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { posApi, PurchaseOrder, LineItem, POFilters } from '../../services/posApi';

interface POsState {
  list: PurchaseOrder[];
  detail: PurchaseOrder | null;
  filters: POFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: POsState = {
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

export const fetchPOs = createAsyncThunk(
  'pos/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: POFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await posApi.listPOs(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase orders');
    }
  }
);

export const fetchPODetail = createAsyncThunk(
  'pos/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await posApi.getPOById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase order');
    }
  }
);

export const createPO = createAsyncThunk(
  'pos/create',
  async (
    data: {
      request_id: string;
      quote_id?: string | null;
      special_instructions?: string;
      delivery_address?: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await posApi.createPO(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create purchase order');
    }
  }
);

export const updatePO = createAsyncThunk(
  'pos/update',
  async (
    params: {
      id: string;
      data: {
        line_items?: LineItem[];
        special_instructions?: string;
        delivery_address?: Record<string, any>;
        required_delivery_date?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      return await posApi.updatePO(params.id, params.data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update purchase order');
    }
  }
);

export const submitPO = createAsyncThunk(
  'pos/submit',
  async (id: string, { rejectWithValue }) => {
    try {
      return await posApi.submitPO(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit purchase order');
    }
  }
);

export const approvePO = createAsyncThunk(
  'pos/approve',
  async (
    params: { id: string; approval_limit: number; comments?: string },
    { rejectWithValue }
  ) => {
    try {
      return await posApi.approvePO(params.id, {
        approval_limit: params.approval_limit,
        comments: params.comments,
      });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve purchase order');
    }
  }
);

export const rejectPO = createAsyncThunk(
  'pos/reject',
  async (params: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await posApi.rejectPO(params.id, { reason: params.reason });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject purchase order');
    }
  }
);

export const deletePO = createAsyncThunk(
  'pos/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await posApi.deletePO(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete purchase order');
    }
  }
);

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<POFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearDetail: (state) => {
      state.detail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch POs
    builder
      .addCase(fetchPOs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPOs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchPOs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch PO Detail
    builder
      .addCase(fetchPODetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPODetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchPODetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create PO
    builder
      .addCase(createPO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPO.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createPO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update PO
    builder
      .addCase(updatePO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePO.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updatePO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Submit PO
    builder
      .addCase(submitPO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitPO.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(submitPO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve PO
    builder
      .addCase(approvePO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approvePO.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(approvePO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reject PO
    builder
      .addCase(rejectPO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectPO.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((po) => po.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(rejectPO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete PO
    builder
      .addCase(deletePO.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePO.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((po) => po.id !== action.payload);
        if (state.detail?.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deletePO.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearDetail, clearError } = posSlice.actions;
export default posSlice.reducer;
