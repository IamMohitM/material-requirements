import api from './api';

export interface Material {
  id: string;
  material_code: string;
  name: string;
  description?: string;
  unit: string;
  category: string;
  unit_price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialsResponse {
  success: boolean;
  data: Material[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface CreateMaterialRequest {
  name: string;
  description?: string;
  unit: string;
  category: string;
  material_code?: string;
}

export const materialsApi = {
  /**
   * Get all materials with pagination
   */
  getMaterials: async (
    page: number = 1,
    pageSize: number = 100,
    category?: string
  ): Promise<MaterialsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (category) params.append('category', category);

    const response = await api.get<MaterialsResponse>(
      `/api/v1/materials?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Search materials by name or code
   */
  searchMaterials: async (query: string): Promise<Material[]> => {
    const response = await materialsApi.getMaterials(1, 100);
    return response.data.filter(
      (m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.material_code.toLowerCase().includes(query.toLowerCase()) ||
        m.id.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Create a new material (admin only)
   */
  createMaterial: async (data: CreateMaterialRequest): Promise<Material> => {
    const response = await api.post<{ success: boolean; data: Material }>(
      '/api/v1/materials',
      data
    );
    return response.data.data;
  },

  /**
   * Get a single material by ID
   */
  getMaterialById: async (id: string): Promise<Material> => {
    const response = await api.get<{ success: boolean; data: Material }>(
      `/api/v1/materials/${id}`
    );
    return response.data.data;
  },
};
