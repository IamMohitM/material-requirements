import { api } from './api';

export interface QuoteLineItem {
  material_id: string;
  material_name?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  delivery_time?: number;
  discount_percent?: number;
}

export interface Quote {
  id: string;
  request_id: string;
  vendor_id: string;
  vendor_name?: string;
  quote_number: string;
  quote_date: string;
  validity_date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'received' | 'accepted';
  total_amount: number;
  line_items: QuoteLineItem[];
  payment_terms: string;
  delivery_location: string;
  created_at: string;
  received_at?: string;
}

export interface QuoteFilters {
  status?: string;
  vendorId?: string;
}

export const quotesApi = {
  async listQuotes(page: number = 1, pageSize: number = 20, filters?: QuoteFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.vendorId && { vendor_id: filters.vendorId }),
    });

    const response = await api.get(`/api/v1/quotes?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getQuoteById(id: string) {
    const response = await api.get(`/api/v1/quotes/${id}`);
    return response.data.data;
  },

  async getQuotesByRequest(requestId: string, page: number = 1, pageSize: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await api.get(`/api/v1/quotes/request/${requestId}?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async createQuote(data: {
    request_id: string;
    vendor_id: string;
    line_items: QuoteLineItem[];
    total_amount: number;
    payment_terms?: string;
    delivery_location?: string;
  }) {
    const response = await api.post('/api/v1/quotes', data);
    return response.data.data;
  },

  async acceptQuote(id: string) {
    const response = await api.post(`/api/v1/quotes/${id}/accept`, {});
    return response.data.data;
  },

  async rejectQuote(id: string, reason: string) {
    const response = await api.post(`/api/v1/quotes/${id}/reject`, { reason });
    return response.data.data;
  },

  async markQuoteReceived(id: string) {
    const response = await api.post(`/api/v1/quotes/${id}/mark-received`, {});
    return response.data.data;
  },
};
