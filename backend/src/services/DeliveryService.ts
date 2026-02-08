import { AppDataSource } from '@config/database';
import { Delivery } from '@entities/Delivery';
import { PurchaseOrder } from '@entities/PurchaseOrder';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { DeliveryStatus, PaginatedResponse, POStatus } from '../types/index';

interface DeliveryLineItem {
  po_line_item_id: string;
  material_id: string;
  quantity_ordered: number;
  quantity_good: number;
  quantity_damaged: number;
  damage_notes?: string;
  brand_received?: string;
  brand_ordered?: string;
  quality_score?: number;
}

export class DeliveryService {
  /**
   * Get repositories with lazy initialization
   */
  private getDeliveryRepository() {
    return AppDataSource.getRepository(Delivery);
  }

  private getPoRepository() {
    return AppDataSource.getRepository(PurchaseOrder);
  }


  
  

  /**
   * Create a delivery record with validation
   */
  async createDelivery(
    po_id: string,
    line_items: DeliveryLineItem[],
    received_by_id: string,
    delivery_date: Date,
    location?: string,
    notes?: string,
    photos?: any[]
  ): Promise<Delivery> {
    if (!po_id || !line_items || line_items.length === 0) {
      throw new ValidationError('PO ID and line items are required');
    }

    if (!delivery_date) {
      throw new ValidationError('Delivery date is required');
    }

    // Fetch PO and validate
    const po = await this.getPoRepository().findOne({ where: { id: po_id } });
    if (!po) {
      throw new NotFoundError('PurchaseOrder', po_id);
    }

    if (po.status === POStatus.CANCELLED) {
      throw new BadRequestError('Cannot create delivery for cancelled PO');
    }

    // Validate delivery date is not before PO order date
    if (delivery_date < po.order_date) {
      throw new ValidationError(
        `Delivery date cannot be before PO order date (${po.order_date})`
      );
    }

    // Validate cumulative quantities and calculate quality scores
    const enrichedLineItems = await Promise.all(
      line_items.map(async (item) => {
        const poLineItem = po.line_items.find(
          (pli: any) => pli.material_id === item.material_id
        );
        if (!poLineItem) {
          throw new BadRequestError(
            `Material ${item.material_id} not found in PO`
          );
        }

        // Check over-receipt
        const totalDelivered = item.quantity_good + item.quantity_damaged;
        const cumulativeQty = await this.getCumulativeQtyDelivered(
          po_id,
          item.material_id
        );

        if (cumulativeQty + totalDelivered > poLineItem.quantity) {
          throw new ValidationError(
            `Over-receipt: Total delivered ${cumulativeQty + totalDelivered} exceeds ordered ${poLineItem.quantity} for material ${item.material_id}`
          );
        }

        // Calculate quality score
        const qualityScore =
          totalDelivered > 0
            ? (item.quantity_good / totalDelivered) * 100
            : 0;

        return {
          ...item,
          quantity_ordered: poLineItem.quantity,
          quality_score: Math.round(qualityScore * 100) / 100,
        };
      })
    );

    // Generate delivery number: DL-YYYY-MM-DDNNN
    const deliveryNumber = this.generateDeliveryNumber();

    const delivery = this.getDeliveryRepository().create({
      id: generateId(),
      delivery_number: deliveryNumber,
      po_id,
      delivery_date,
      received_by_id,
      received_at: new Date(),
      status: DeliveryStatus.PARTIAL,
      delivery_location: location,
      notes,
      photos,
      line_items: enrichedLineItems as any,
    });

    await this.getDeliveryRepository().save(delivery);

    // Update PO delivery status
    await this.updatePODeliveryStatus(po_id);

    return delivery;
  }

  /**
   * Get delivery by ID
   */
  async getDeliveryById(id: string): Promise<Delivery> {
    const delivery = await this.getDeliveryRepository().findOne({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery', id);
    }

    return delivery;
  }

  /**
   * Get deliveries for a PO
   */
  async getDeliveriesByPO(
    po_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Delivery>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getDeliveryRepository()
      .createQueryBuilder('delivery')
      .where('delivery.po_id = :po_id', { po_id })
      .orderBy('delivery.delivery_date', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Get all deliveries with pagination
   */
  async getDeliveries(options: {
    status?: DeliveryStatus;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Delivery>> {
    const { status, page = 1, pageSize = 20 } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getDeliveryRepository().createQueryBuilder('delivery');

    if (status) {
      query.andWhere('delivery.status = :status', { status });
    }

    const [items, total] = await query
      .orderBy('delivery.delivery_date', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Update delivery (only in PENDING status)
   */
  async updateDelivery(
    id: string,
    updates: {
      notes?: string;
      photos?: any[];
      location?: string;
      line_items?: DeliveryLineItem[];
    }
  ): Promise<Delivery> {
    const delivery = await this.getDeliveryById(id);

    // Can only edit in PENDING status
    if (delivery.status !== DeliveryStatus.PENDING) {
      throw new BadRequestError(
        `Cannot update delivery in ${delivery.status} status`
      );
    }

    if (updates.notes) delivery.notes = updates.notes;
    if (updates.photos) delivery.photos = updates.photos;
    if (updates.location) delivery.delivery_location = updates.location;

    if (updates.line_items) {
      // Recalculate quality scores for updated items
      delivery.line_items = updates.line_items.map((item) => {
        const totalDelivered = item.quantity_good + item.quantity_damaged;
        const qualityScore =
          totalDelivered > 0
            ? (item.quantity_good / totalDelivered) * 100
            : 0;

        return {
          ...item,
          quality_score: Math.round(qualityScore * 100) / 100,
        };
      }) as any;
    }

    await this.getDeliveryRepository().save(delivery);
    return delivery;
  }

  /**
   * Delete delivery (only in PENDING status)
   */
  async deleteDelivery(id: string): Promise<void> {
    const delivery = await this.getDeliveryById(id);

    if (delivery.status !== DeliveryStatus.PENDING) {
      throw new BadRequestError(
        `Cannot delete delivery in ${delivery.status} status`
      );
    }

    await this.getDeliveryRepository().remove(delivery);

    // Update PO delivery status
    await this.updatePODeliveryStatus(delivery.po_id);
  }

  /**
   * Mark delivery as complete
   */
  async completeDelivery(
    id: string,
    completed_by_id: string
  ): Promise<Delivery> {
    const delivery = await this.getDeliveryById(id);

    if (delivery.status === DeliveryStatus.COMPLETE) {
      throw new BadRequestError('Delivery is already complete');
    }

    delivery.status = DeliveryStatus.COMPLETE;
    await this.getDeliveryRepository().save(delivery);

    // Update PO delivery status
    await this.updatePODeliveryStatus(delivery.po_id);

    // Trigger invoice re-matching
    await this.triggerInvoiceReMatching(delivery.po_id);

    return delivery;
  }

  /**
   * Trigger re-matching of invoices for a PO
   */
  async triggerInvoiceReMatching(po_id: string): Promise<void> {
    // This will be implemented when InvoiceService matching is complete
    // For now, just a placeholder
  }

  /**
   * Get cumulative quantity delivered for a material on a PO
   */
  private async getCumulativeQtyDelivered(
    po_id: string,
    material_id: string
  ): Promise<number> {
    const deliveries = await this.getDeliveryRepository().find({
      where: { po_id },
    });

    let cumulativeQty = 0;
    for (const delivery of deliveries) {
      const lineItem = delivery.line_items.find(
        (li: any) => li.material_id === material_id
      );
      if (lineItem) {
        cumulativeQty +=
          (lineItem.quantity_good || 0) + (lineItem.quantity_damaged || 0);
      }
    }

    return cumulativeQty;
  }

  /**
   * Update PO delivery status based on deliveries
   */
  private async updatePODeliveryStatus(po_id: string): Promise<void> {
    const po = await this.getPoRepository().findOne({ where: { id: po_id } });
    if (!po) return;

    const deliveries = await this.getDeliveryRepository().find({
      where: { po_id },
    });

    // Check if all materials are fully delivered
    let allDelivered = true;
    for (const poLineItem of po.line_items) {
      let totalDelivered = 0;
      for (const delivery of deliveries) {
        const lineItem = delivery.line_items.find(
          (li: any) => li.material_id === poLineItem.material_id
        );
        if (lineItem) {
          totalDelivered +=
            (lineItem.quantity_good || 0) + (lineItem.quantity_damaged || 0);
        }
      }

      if (totalDelivered < poLineItem.quantity) {
        allDelivered = false;
        break;
      }
    }

    // Update PO status
    if (deliveries.length === 0) {
      po.delivery_status = 'PENDING';
    } else if (allDelivered) {
      po.delivery_status = 'FULLY_RECEIVED';
      po.status = POStatus.DELIVERED;
    } else {
      po.delivery_status = 'PARTIALLY_RECEIVED';
    }

    await this.getPoRepository().save(po);
  }

  /**
   * Generate unique delivery number: DL-YYYY-MM-DDNNN
   */
  private generateDeliveryNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `DL-${year}${month}${day}${randomNum}`;
  }
}

export default new DeliveryService();
