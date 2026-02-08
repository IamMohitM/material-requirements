import { api } from './api';
import { Delivery, DeliveryFilters } from '../store/slices/deliveriesSlice';

export const deliveriesApi = {
  async listDeliveries(page: number = 1, pageSize: number = 20, filters?: DeliveryFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.poId && { poId: filters.poId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.searchTerm && { search: filters.searchTerm }),
      ...(filters?.dateRange && {
        dateFrom: filters.dateRange[0],
        dateTo: filters.dateRange[1],
      }),
    });

    const response = await api.get(`/api/v1/deliveries?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getDelivery(id: string) {
    const response = await api.get(`/api/v1/deliveries/${id}`);
    return response.data.data;
  },

  async createDelivery(
    data: Omit<Delivery, 'id' | 'delivery_number' | 'created_at' | 'updated_at'>
  ) {
    const response = await api.post('/api/v1/deliveries', {
      po_id: data.po_id,
      delivery_date: data.delivery_date,
      received_by_id: data.received_by_id,
      delivery_location: data.delivery_location,
      line_items: data.line_items,
    });
    return response.data.data;
  },

  async updateDelivery(id: string, data: Partial<Delivery>) {
    const response = await api.put(`/api/v1/deliveries/${id}`, data);
    return response.data.data;
  },

  async completeDelivery(id: string) {
    const response = await api.post(`/api/v1/deliveries/${id}/complete`);
    return response.data.data;
  },

  async deleteDelivery(id: string) {
    await api.delete(`/api/v1/deliveries/${id}`);
  },
};
