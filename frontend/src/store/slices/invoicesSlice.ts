import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoicesApi } from '../../services/invoicesApi';

export interface InvoiceLineItem {
  material_id: string;
  material_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  brand_invoiced?: string;
}

export interface MatchAnalysis {
  quantity_match: {
    status: 'MATCHED' | 'WARNING' | 'CRITICAL';
    ordered: number;
    delivered: number;
    invoiced: number;
    message: string;
  };
  price_match: {
    status: 'MATCHED' | 'WARNING' | 'CRITICAL';
    po_price: number;
    invoice_price: number;
    variance_percent: number;
    message: string;
  };
  brand_match: {
    status: 'MATCHED' | 'WARNING' | 'CRITICAL';
    ordered: string;
    delivered: string;
    invoiced: string;
    message: string;
  };
  timing_match: {
    status: 'MATCHED' | 'WARNING' | 'CRITICAL';
    delivery_date: string;
    invoice_date: string;
    message: string;
  };
  overall_status: 'FULLY_MATCHED' | 'PARTIAL_MATCHED' | 'MISMATCHED';
  discrepancies: number;
}

export interface Invoice {
  id: string;
  po_id: string;
  vendor_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  matching_status: 'UNMATCHED' | 'PARTIAL_MATCHED' | 'FULLY_MATCHED' | 'CRITICAL_ISSUE';
  approved_by_id?: string;
  approved_at?: string;
  approval_notes?: string;
  line_items: InvoiceLineItem[];
  match_analysis: MatchAnalysis | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFilters {
  poId?: string;
  vendorId?: string;
  status?: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  matchingStatus?: 'UNMATCHED' | 'PARTIAL_MATCHED' | 'FULLY_MATCHED' | 'CRITICAL_ISSUE';
  dateRange?: [string, string];
  searchTerm?: string;
}

interface InvoicesState {
  list: Invoice[];
  detail: Invoice | null;
  filters: InvoiceFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
  selectedInvoices: string[];
}

const initialState: InvoicesState = {
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
  selectedInvoices: [],
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: InvoiceFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await invoicesApi.listInvoices(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceDetail = createAsyncThunk(
  'invoices/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await invoicesApi.getInvoice(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch invoice');
    }
  }
);

export const submitInvoice = createAsyncThunk(
  'invoices/submit',
  async (data: Omit<Invoice, 'id' | 'status' | 'matching_status' | 'match_analysis' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await invoicesApi.createInvoice(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/update',
  async ({ id, data }: { id: string; data: Partial<Invoice> }, { rejectWithValue }) => {
    try {
      return await invoicesApi.updateInvoice(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update invoice');
    }
  }
);

export const approveInvoice = createAsyncThunk(
  'invoices/approve',
  async ({ id, notes }: { id: string; notes?: string }, { rejectWithValue }) => {
    try {
      return await invoicesApi.approveInvoice(id, notes);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve invoice');
    }
  }
);

export const rejectInvoice = createAsyncThunk(
  'invoices/reject',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await invoicesApi.rejectInvoice(id, reason);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await invoicesApi.deleteInvoice(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete invoice');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<InvoiceFilters>) => {
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
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchInvoiceDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchInvoiceDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(submitInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(submitInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(approveInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(approveInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(rejectInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(rejectInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((i) => i.id !== action.payload);
        if (state.detail?.id === action.payload) {
          state.detail = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, setPage } = invoicesSlice.actions;
export default invoicesSlice.reducer;
