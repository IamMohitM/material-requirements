import api from './api';
import { DeliveryFilters } from '../store/slices/deliveriesSlice';

export interface DeliveryLineItem {
  po_line_item_id: string;
  material_id: string;
  quantity_ordered: number;
  quantity_good: number;
  quantity_damaged: number;
  damage_notes?: string;
  brand_received?: string;
  brand_ordered?: string;
}

export interface CreateDeliveryPayload {
  po_id: string;
  line_items: DeliveryLineItem[];
  received_by_id: string;
  delivery_date: string;
  location?: string;
  location_details?: string;
  notes?: string;
  photos?: any[];
}

export interface UpdateDeliveryPayload {
  line_items?: DeliveryLineItem[];
  location?: string;
  location_details?: string;
  notes?: string;
  photos?: any[];
}

export const deliveriesApi = {
  /**
   * Get all deliveries with pagination and filtering
   */
  listDeliveries: async (page: number = 1, pageSize: number = 20, filters?: DeliveryFilters) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.poId) {
      params.append('po_id', filters.poId);
    }

    const response = await api.get(`/api/v1/deliveries?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific delivery by ID
   */
  getDelivery: async (id: string) => {
    const response = await api.get(`/api/v1/deliveries/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Create a new delivery receipt
   */
  createDelivery: async (payload: any) => {
    const response = await api.post('/api/v1/deliveries', payload);
    return response.data.data || response.data;
  },

  /**
   * Update a delivery (only in PENDING status)
   */
  updateDelivery: async (id: string, payload: any) => {
    const response = await api.put(`/api/v1/deliveries/${id}`, payload);
    return response.data.data || response.data;
  },

  /**
   * Delete a delivery (only in PENDING status)
   */
  deleteDelivery: async (id: string) => {
    const response = await api.delete(`/api/v1/deliveries/${id}`);
    return response.data;
  },

  /**
   * Mark a delivery as COMPLETE
   */
  completeDelivery: async (id: string) => {
    const response = await api.post(`/api/v1/deliveries/${id}/complete`, {});
    return response.data.data || response.data;
  },
};
