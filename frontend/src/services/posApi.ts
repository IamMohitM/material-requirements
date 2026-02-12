import { api } from './api';

export interface LineItem {
  material_id: string;
  material_name?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  gst_amount: number;
  total: number;
}

export interface ApprovalChainEntry {
  approver_id: string;
  approver_name?: string;
  approval_limit: number;
  action: 'approved' | 'rejected';
  timestamp: string;
  comments?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  project_name?: string;
  request_id: string;
  vendor_id: string;
  vendor_name?: string;
  quote_id: string;
  order_date: string;
  required_delivery_date: string;
  status: 'draft' | 'sent' | 'approved' | 'received' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected' | 'archived';
  total_amount: number;
  line_items: LineItem[];
  approval_chain: ApprovalChainEntry[];
  delivery_address?: Record<string, any>;
  special_instructions?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface POFilters {
  status?: string;
  vendorId?: string;
  projectId?: string;
  approvalStatus?: string;
}

export const posApi = {
  async listPOs(page: number = 1, pageSize: number = 20, filters?: POFilters) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.vendorId && { vendor_id: filters.vendorId }),
      ...(filters?.projectId && { project_id: filters.projectId }),
      ...(filters?.approvalStatus && { approval_status: filters.approvalStatus }),
    });

    const response = await api.get(`/api/v1/pos?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async getPOById(id: string) {
    const response = await api.get(`/api/v1/pos/${id}`);
    return response.data.data;
  },

  async getPOsByProject(projectId: string, page: number = 1, pageSize: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await api.get(`/api/v1/pos/project/${projectId}?${params.toString()}`);
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  async createPO(data: {
    request_id: string;
    quote_id?: string | null;
    special_instructions?: string;
    delivery_address?: Record<string, any>;
  }) {
    const response = await api.post('/api/v1/pos', data);
    return response.data.data;
  },

  async updatePO(
    id: string,
    data: {
      line_items?: LineItem[];
      special_instructions?: string;
      delivery_address?: Record<string, any>;
      required_delivery_date?: string;
    }
  ) {
    const response = await api.put(`/api/v1/pos/${id}`, data);
    return response.data.data;
  },

  async submitPO(id: string) {
    const response = await api.post(`/api/v1/pos/${id}/submit`, {});
    return response.data.data;
  },

  async approvePO(id: string, data: { approval_limit: number; comments?: string }) {
    const response = await api.post(`/api/v1/pos/${id}/approve`, data);
    return response.data.data;
  },

  async rejectPO(id: string, data: { reason: string }) {
    const response = await api.post(`/api/v1/pos/${id}/reject`, data);
    return response.data.data;
  },

  async deletePO(id: string) {
    await api.delete(`/api/v1/pos/${id}`);
  },
};
