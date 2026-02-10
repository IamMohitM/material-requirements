import { api } from './api';
import { Vendor, VendorFilters, VendorRate } from '../store/slices/vendorsSlice';

const normalizeRate = (rate: any): VendorRate => ({
  ...rate,
  price: Number(rate?.price),
});

const normalizeVendor = (vendor: any): Vendor => ({
  ...vendor,
  rating: vendor?.rating === null || vendor?.rating === undefined ? undefined : Number(vendor.rating),
  delivery_lead_time_days:
    vendor?.delivery_lead_time_days === null || vendor?.delivery_lead_time_days === undefined
      ? undefined
      : Number(vendor.delivery_lead_time_days),
  rates: Array.isArray(vendor?.rates) ? vendor.rates.map(normalizeRate) : vendor?.rates,
  rate_history: Array.isArray(vendor?.rate_history)
    ? vendor.rate_history.map((history: any) => ({
        ...history,
        price_old: Number(history?.price_old),
        price_new: Number(history?.price_new),
        change_percentage: Number(history?.change_percentage),
      }))
    : vendor?.rate_history,
});

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
      data: Array.isArray(response.data.data)
        ? response.data.data.map(normalizeVendor)
        : response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getVendor(id: string) {
    const response = await api.get(`/api/v1/vendors/${id}`);
    return normalizeVendor(response.data.data);
  },

  async createVendor(data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) {
    const payload: any = {
      name: data.name,
      is_active: data.is_active,
    };

    // Only add optional fields if they have values
    if (data.contact_person?.trim()) payload.contact_person = data.contact_person.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.address?.trim()) payload.address = data.address.trim();

    const response = await api.post('/api/v1/vendors', payload);
    return normalizeVendor(response.data.data);
  },

  async updateVendor(id: string, data: Partial<Vendor>) {
    const response = await api.put(`/api/v1/vendors/${id}`, data);
    return normalizeVendor(response.data.data);
  },

  async getRateHistory(id: string) {
    const response = await api.get(`/api/v1/vendors/${id}/rate-history`);
    return Array.isArray(response.data.data)
      ? response.data.data.map((history: any) => ({
          ...history,
          price_old: Number(history?.price_old),
          price_new: Number(history?.price_new),
          change_percentage: Number(history?.change_percentage),
        }))
      : [];
  },

  async updateRates(id: string, rates: VendorRate[]) {
    const response = await api.post(`/api/v1/vendors/${id}/rates`, { rates });
    return normalizeVendor(response.data.data);
  },

  async deleteVendor(id: string) {
    await api.delete(`/api/v1/vendors/${id}`);
  },
};
