import api from './api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  status: string;
  created_by_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  status?: string;
}

export const projectsApi = {
  /**
   * Get all projects with pagination
   */
  getProjects: async (
    page: number = 1,
    pageSize: number = 100,
    status?: string
  ): Promise<ProjectsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status) params.append('status', status);

    const response = await api.get<ProjectsResponse>(
      `/api/v1/projects?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Search projects by name
   */
  searchProjects: async (query: string): Promise<Project[]> => {
    const response = await projectsApi.getProjects(1, 100);
    return response.data.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Create a new project
   */
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>(
      '/api/v1/projects',
      data
    );
    return response.data.data;
  },

  /**
   * Get a single project by ID
   */
  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get<{ success: boolean; data: Project }>(
      `/api/v1/projects/${id}`
    );
    return response.data.data;
  },

  /**
   * Update a project
   */
  updateProject: async (id: string, data: CreateProjectRequest): Promise<Project> => {
    const response = await api.put<{ success: boolean; data: Project }>(
      `/api/v1/projects/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${id}`);
  },
};
