import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectsApi, Project, CreateProjectRequest } from '../../services/projectsApi';

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 100,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (
    params: { page?: number; pageSize?: number; status?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await projectsApi.getProjects(
        params.page || 1,
        params.pageSize || 100,
        params.status
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch projects');
    }
  }
);

export const searchProjects = createAsyncThunk(
  'projects/searchProjects',
  async (query: string, { rejectWithValue }) => {
    try {
      return await projectsApi.searchProjects(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to search projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: CreateProjectRequest, { rejectWithValue }) => {
    try {
      return await projectsApi.createProject(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create project');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectsApi.getProjectById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.total = action.payload.meta.total;
        state.page = action.payload.meta.page;
        state.pageSize = action.payload.meta.page_size;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search projects
      .addCase(searchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(searchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single project
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
