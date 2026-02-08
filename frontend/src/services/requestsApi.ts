import { api } from './api';
import { Request, RequestFilters } from '../store/slices/requestsSlice';

export const requestsApi = {
  async listRequests(page: number = 1, pageSize: number = 20, filters?: RequestFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.projectId && { projectId: filters.projectId }),
      ...(filters?.searchTerm && { search: filters.searchTerm }),
      ...(filters?.dateRange && {
        dateFrom: filters.dateRange[0],
        dateTo: filters.dateRange[1],
      }),
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

  async createRequest(data: Omit<Request, 'id' | 'request_number' | 'created_at' | 'updated_at' | 'status'>) {
    const response = await api.post('/api/v1/requests', {
      project_id: data.project_id,
      requester_id: data.requester_id,
      requester_name: data.requester_name,
      line_items: data.line_items,
      priority: data.priority,
      delivery_date: data.delivery_date,
    });
    return response.data.data;
  },

  async updateRequest(id: string, data: Partial<Request>) {
    const response = await api.put(`/api/v1/requests/${id}`, data);
    return response.data.data;
  },

  async approveRequest(id: string, data: { approval_comments?: string }) {
    const response = await api.post(`/api/v1/requests/${id}/approve`, data);
    return response.data.data;
  },

  async rejectRequest(id: string, data: { approval_comments?: string }) {
    const response = await api.post(`/api/v1/requests/${id}/reject`, data);
    return response.data.data;
  },

  async deleteRequest(id: string) {
    await api.delete(`/api/v1/requests/${id}`);
  },
};
