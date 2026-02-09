import { api } from './api';
import { RequestFilters, Material } from '../store/slices/requestsSlice';

export const requestsApi = {
  async listRequests(page: number = 1, pageSize: number = 20, filters?: RequestFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.projectId && { project_id: filters.projectId }),
      ...(filters?.searchTerm && { search: filters.searchTerm }),
    });

    const response = await api.get(`/api/v1/requests?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getRequest(id: string) {
    const response = await api.get(`/api/v1/requests/${id}`);
    return response.data.data;
  },

  async createRequest(data: {
    project_id: string;
    materials: Material[];
    approval_notes?: string;
  }) {
    const response = await api.post('/api/v1/requests', {
      project_id: data.project_id,
      materials: data.materials,
      approval_notes: data.approval_notes,
    });
    return response.data.data;
  },

  async updateRequest(id: string, data: { materials: Material[] }) {
    const response = await api.put(`/api/v1/requests/${id}`, data);
    return response.data.data;
  },

  async submitRequest(id: string) {
    const response = await api.post(`/api/v1/requests/${id}/submit`, {});
    return response.data.data;
  },

  async approveRequest(id: string, data: { comments?: string }) {
    const response = await api.post(`/api/v1/requests/${id}/approve`, {
      comments: data.comments,
    });
    return response.data.data;
  },

  async rejectRequest(id: string, data: { reason?: string }) {
    const response = await api.post(`/api/v1/requests/${id}/reject`, {
      reason: data.reason,
    });
    return response.data.data;
  },

  async deleteRequest(id: string) {
    await api.delete(`/api/v1/requests/${id}`);
  },

  async convertToPO(id: string) {
    const response = await api.post(`/api/v1/requests/${id}/convert-to-po`, {});
    return response.data.data;
  },
};
