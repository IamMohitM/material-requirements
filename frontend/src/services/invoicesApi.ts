import { api } from './api';
import { Invoice, InvoiceFilters } from '../store/slices/invoicesSlice';

export const invoicesApi = {
  async listInvoices(page: number = 1, pageSize: number = 20, filters?: InvoiceFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.poId && { poId: filters.poId }),
      ...(filters?.vendorId && { vendorId: filters.vendorId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.matchingStatus && { matchingStatus: filters.matchingStatus }),
      ...(filters?.searchTerm && { search: filters.searchTerm }),
      ...(filters?.dateRange && {
        dateFrom: filters.dateRange[0],
        dateTo: filters.dateRange[1],
      }),
    });

    const response = await api.get(`/api/v1/invoices?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getInvoice(id: string) {
    const response = await api.get(`/api/v1/invoices/${id}`);
    return response.data.data;
  },

  async createInvoice(
    data: Omit<Invoice, 'id' | 'status' | 'matching_status' | 'match_analysis' | 'created_at' | 'updated_at'>
  ) {
    const response = await api.post('/api/v1/invoices', {
      po_id: data.po_id,
      vendor_id: data.vendor_id,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      due_date: data.due_date,
      total_amount: data.total_amount,
      line_items: data.line_items,
    });
    return response.data.data;
  },

  async updateInvoice(id: string, data: Partial<Invoice>) {
    const response = await api.put(`/api/v1/invoices/${id}`, data);
    return response.data.data;
  },

  async approveInvoice(id: string, notes?: string) {
    const response = await api.post(`/api/v1/invoices/${id}/approve`, {
      approval_notes: notes,
    });
    return response.data.data;
  },

  async rejectInvoice(id: string, reason: string) {
    const response = await api.post(`/api/v1/invoices/${id}/reject`, {
      rejection_reason: reason,
    });
    return response.data.data;
  },

  async deleteInvoice(id: string) {
    await api.delete(`/api/v1/invoices/${id}`);
  },
};
