import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { materialsApi, Material, CreateMaterialRequest } from '../../services/materialsApi';

interface MaterialsState {
  materials: Material[];
  selectedMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: MaterialsState = {
  materials: [],
  selectedMaterial: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 100,
};

export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (
    params: { page?: number; pageSize?: number; category?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await materialsApi.getMaterials(
        params.page || 1,
        params.pageSize || 100,
        params.category
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch materials');
    }
  }
);

export const searchMaterials = createAsyncThunk(
  'materials/searchMaterials',
  async (query: string, { rejectWithValue }) => {
    try {
      return await materialsApi.searchMaterials(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to search materials');
    }
  }
);

export const createMaterial = createAsyncThunk(
  'materials/createMaterial',
  async (data: CreateMaterialRequest, { rejectWithValue }) => {
    try {
      return await materialsApi.createMaterial(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create material');
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  'materials/fetchMaterialById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await materialsApi.getMaterialById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch material');
    }
  }
);

const materialsSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMaterial: (state, action: PayloadAction<Material | null>) => {
      state.selectedMaterial = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch materials
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.data;
        state.total = action.payload.meta.total;
        state.page = action.payload.meta.page;
        state.pageSize = action.payload.meta.page_size;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search materials
      .addCase(searchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload;
      })
      .addCase(searchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create material
      .addCase(createMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials.unshift(action.payload);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single material
      .addCase(fetchMaterialById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMaterial = action.payload;
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedMaterial } = materialsSlice.actions;
export default materialsSlice.reducer;
