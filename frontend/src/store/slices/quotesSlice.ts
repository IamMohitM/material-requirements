import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { quotesApi, Quote, QuoteFilters } from '../../services/quotesApi';

interface QuotesState {
  list: Quote[];
  detail: Quote | null;
  filters: QuoteFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: QuotesState = {
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

export const fetchQuotes = createAsyncThunk(
  'quotes/fetchList',
  async (
    params: {
      page?: number;
      pageSize?: number;
      filters?: QuoteFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await quotesApi.listQuotes(
        params.page || 1,
        params.pageSize || 20,
        params.filters
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quotes');
    }
  }
);

export const fetchQuoteDetail = createAsyncThunk(
  'quotes/fetchDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      return await quotesApi.getQuoteById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quote');
    }
  }
);

export const fetchQuotesByRequest = createAsyncThunk(
  'quotes/fetchByRequest',
  async (
    params: { requestId: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      return await quotesApi.getQuotesByRequest(
        params.requestId,
        params.page || 1,
        params.pageSize || 20
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quotes for request');
    }
  }
);

export const acceptQuote = createAsyncThunk(
  'quotes/accept',
  async (id: string, { rejectWithValue }) => {
    try {
      return await quotesApi.acceptQuote(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to accept quote');
    }
  }
);

export const rejectQuote = createAsyncThunk(
  'quotes/reject',
  async (params: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await quotesApi.rejectQuote(params.id, params.reason);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject quote');
    }
  }
);

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<QuoteFilters>) => {
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
    // Fetch Quotes
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Quote Detail
    builder
      .addCase(fetchQuoteDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuoteDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchQuoteDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Quotes by Request
    builder
      .addCase(fetchQuotesByRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotesByRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.pagination.total = action.payload.total;
      })
      .addCase(fetchQuotesByRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Accept Quote
    builder
      .addCase(acceptQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(acceptQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Reject Quote
    builder
      .addCase(rejectQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.list.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.detail?.id === action.payload.id) {
          state.detail = action.payload;
        }
      })
      .addCase(rejectQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearDetail, clearError } = quotesSlice.actions;
export default quotesSlice.reducer;
