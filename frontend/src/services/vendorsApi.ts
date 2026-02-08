import { api } from './api';
import { Vendor, VendorFilters, VendorRate } from '../store/slices/vendorsSlice';

export const vendorsApi = {
  async listVendors(page: number = 1, pageSize: number = 20, filters?: VendorFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.searchTerm && { search: filters.searchTerm }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive.toString() }),
      ...(filters?.rating && { rating: filters.rating.toString() }),
    });

    const response = await api.get(`/api/v1/vendors?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getVendor(id: string) {
    const response = await api.get(`/api/v1/vendors/${id}`);
    return response.data.data;
  },

  async createVendor(data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) {
    const response = await api.post('/api/v1/vendors', {
      name: data.name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country: data.country,
      payment_terms: data.payment_terms,
      delivery_lead_time_days: data.delivery_lead_time_days,
      specialties: data.specialties,
      is_active: data.is_active,
    });
    return response.data.data;
  },

  async updateVendor(id: string, data: Partial<Vendor>) {
    const response = await api.put(`/api/v1/vendors/${id}`, data);
    return response.data.data;
  },

  async getRateHistory(id: string) {
    const response = await api.get(`/api/v1/vendors/${id}/rate-history`);
    return response.data.data || [];
  },

  async updateRates(id: string, rates: VendorRate[]) {
    const response = await api.post(`/api/v1/vendors/${id}/rates`, { rates });
    return response.data.data;
  },

  async deleteVendor(id: string) {
    await api.delete(`/api/v1/vendors/${id}`);
  },
};
