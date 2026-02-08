import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { requestsApi } from '../../services/requestsApi';

export interface RequestLineItem {
  material_id: string;
  material_name: string;
  quantity: number;
  unit_price: number;
  description?: string;
}

export interface Request {
  id: string;
  project_id: string;
  requester_id: string;
  requester_name: string;
  request_number: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'QUOTED' | 'PO_CREATED';
  line_items: RequestLineItem[];
  priority?: string;
  delivery_date?: string;
  approved_by?: string;
  approval_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestFilters {
  status?: string;
  projectId?: string;
  dateRange?: [string, string];
  searchTerm?: string;
}

interface RequestsState {
  list: Request[];
  detail: Request | null;
  filters: RequestFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
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

export const fetchRequests = createAsyncThunk(
  'requests/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: RequestFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await requestsApi.listRequests(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch requests');
    }
  }
);

export const fetchRequestDetail = createAsyncThunk(
  'requests/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await requestsApi.getRequest(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch request');
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (
    data: Omit<Request, 'id' | 'request_number' | 'created_at' | 'updated_at' | 'status'>,
    { rejectWithValue }
  ) => {
    try {
      return await requestsApi.createRequest(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create request');
    }
  }
);

export const updateRequest = createAsyncThunk(
  'requests/update',
  async ({ id, data }: { id: string; data: Partial<Request> }, { rejectWithValue }) => {
    try {
      return await requestsApi.updateRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update request');
    }
  }
);

export const approveRequest = createAsyncThunk(
  'requests/approve',
  async ({ id, comments }: { id: string; comments?: string }, { rejectWithValue }) => {
    try {
      return await requestsApi.approveRequest(id, { approval_comments: comments });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve request');
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'requests/reject',
  async ({ id, comments }: { id: string; comments?: string }, { rejectWithValue }) => {
    try {
      return await requestsApi.rejectRequest(id, { approval_comments: comments });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject request');
    }
  }
);

export const deleteRequest = createAsyncThunk(
  'requests/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await requestsApi.deleteRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete request');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RequestFilters>) => {
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
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchRequestDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchRequestDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(approveRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(rejectRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((r) => r.id !== action.payload);
        if (state.detail?.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, setPage } = requestsSlice.actions;
export default requestsSlice.reducer;
