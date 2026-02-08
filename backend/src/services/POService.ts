import { AppDataSource } from '@config/database';
import { PurchaseOrder } from '@entities/PurchaseOrder';
import { POLineItemBrand } from '@entities/POLineItemBrand';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  generatePONumber,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { POStatus, ApprovalStatus, PaginatedResponse } from '../types/index';

export class POService {
  /**
   * Get repositories with lazy initialization
   */
  private getPoRepository() {
    return AppDataSource.getRepository(PurchaseOrder);
  }

  private getPoLineBrandRepository() {
    return AppDataSource.getRepository(POLineItemBrand);
  }


  
  

  /**
   * Create a PO from a quote
   */
  async createPO(
    project_id: string,
    request_id: string,
    vendor_id: string,
    quote_id: string,
    line_items: any[],
    total_amount: number,
    required_delivery_date: Date,
    created_by: string,
    delivery_address?: any,
    special_instructions?: string
  ): Promise<PurchaseOrder> {
    if (!project_id || !request_id || !vendor_id || !line_items.length) {
      throw new ValidationError(
        'Project, Request, Vendor, and line items are required'
      );
    }

    const po = this.getPoRepository().create({
      id: generateId(),
      po_number: generatePONumber(),
      project_id,
      request_id,
      vendor_id,
      quote_id,
      order_date: new Date(),
      required_delivery_date,
      status: POStatus.DRAFT,
      line_items,
      total_amount,
      approval_status: ApprovalStatus.PENDING,
      delivery_address: delivery_address || {},
      special_instructions,
      created_by,
    });

    await this.getPoRepository().save(po);

    // Create brand tracking records
    for (const lineItem of line_items) {
      await this.getPoLineBrandRepository().save({
        id: generateId(),
        po_id: po.id,
        material_id: lineItem.material_id,
        brand_id: lineItem.brand_id || null,
      });
    }

    return po;
  }

  /**
   * Get PO by ID
   */
  async getPOById(id: string): Promise<PurchaseOrder> {
    const po = await this.getPoRepository().findOne({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order', id);
    }

    return po;
  }

  /**
   * Get all POs with pagination
   */
  async getPOs(options: {
    status?: POStatus;
    project_id?: string;
    vendor_id?: string;
    approval_status?: ApprovalStatus;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<PurchaseOrder>> {
    const {
      status,
      project_id,
      vendor_id,
      approval_status,
      page = 1,
      pageSize = 20,
    } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getPoRepository().createQueryBuilder('po');

    if (status) {
      query.andWhere('po.status = :status', { status });
    }

    if (project_id) {
      query.andWhere('po.project_id = :project_id', { project_id });
    }

    if (vendor_id) {
      query.andWhere('po.vendor_id = :vendor_id', { vendor_id });
    }

    if (approval_status) {
      query.andWhere('po.approval_status = :approval_status', {
        approval_status,
      });
    }

    const [items, total] = await query
      .orderBy('po.created_at', 'DESC')
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
   * Update PO (draft only)
   */
  async updatePO(
    id: string,
    updates: {
      line_items?: any[];
      delivery_address?: any;
      special_instructions?: string;
      required_delivery_date?: Date;
    }
  ): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);

    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestError('Can only update POs in DRAFT status');
    }

    if (updates.line_items) {
      po.line_items = updates.line_items;
      po.total_amount = updates.line_items.reduce(
        (sum: number, item: any) => sum + (item.total || 0),
        0
      );
    }

    if (updates.delivery_address) {
      po.delivery_address = updates.delivery_address;
    }

    if (updates.special_instructions) {
      po.special_instructions = updates.special_instructions;
    }

    if (updates.required_delivery_date) {
      po.required_delivery_date = updates.required_delivery_date;
    }

    await this.getPoRepository().save(po);
    return po;
  }

  /**
   * Submit PO for approval
   */
  async submitPO(id: string): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);

    if (po.status !== POStatus.DRAFT) {
      throw new BadRequestError(
        'Can only submit POs in DRAFT status'
      );
    }

    po.status = POStatus.SENT;
    await this.getPoRepository().save(po);
    return po;
  }

  /**
   * Approve PO
   */
  async approvePO(
    id: string,
    approver_id: string,
    approval_limit: number,
    comments?: string
  ): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);

    if (po.total_amount > approval_limit) {
      throw new BadRequestError(
        `PO amount exceeds approval limit of ${approval_limit}`
      );
    }

    po.approval_status = ApprovalStatus.APPROVED;

    // Add to approval chain
    const chain = ((po.approval_chain as unknown) as any[]) || [];
    chain.push({
      approver_id,
      approval_limit,
      action: 'approved',
      timestamp: new Date(),
      comments,
    });

    po.approval_chain = chain as any;

    await this.getPoRepository().save(po);
    return po;
  }

  /**
   * Reject PO
   */
  async rejectPO(
    id: string,
    rejector_id: string,
    reason: string
  ): Promise<PurchaseOrder> {
    const po = await this.getPOById(id);

    po.approval_status = ApprovalStatus.REJECTED;

    const chain = ((po.approval_chain as unknown) as any[]) || [];
    chain.push({
      rejector_id,
      action: 'rejected',
      timestamp: new Date(),
      reason,
    });

    po.approval_chain = chain as any;

    await this.getPoRepository().save(po);
    return po;
  }

  /**
   * Select brand for PO line item
   */
  async selectBrand(
    po_id: string,
    material_id: string,
    brand_id: string,
    selected_by: string
  ): Promise<POLineItemBrand> {
    const po = await this.getPOById(po_id);

    let poLineBrand = await this.getPoLineBrandRepository().findOne({
      where: { po_id, material_id },
    });

    if (!poLineBrand) {
      poLineBrand = this.getPoLineBrandRepository().create({
        id: generateId(),
        po_id,
        material_id,
      });
    }

    poLineBrand.brand_id = brand_id;
    poLineBrand.selected_date = new Date();
    poLineBrand.selected_by_id = selected_by;

    await this.getPoLineBrandRepository().save(poLineBrand);

    // Update PO line item with brand
    po.line_items = po.line_items.map((item: any) =>
      item.material_id === material_id
        ? { ...item, brand_id }
        : item
    );

    await this.getPoRepository().save(po);

    return poLineBrand;
  }

  /**
   * Get pending POs for approval
   */
  async getPendingApprovals(
    approver_id: string,
    approval_limit: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getPoRepository()
      .createQueryBuilder('po')
      .where('po.approval_status = :status', { status: ApprovalStatus.PENDING })
      .andWhere('po.total_amount <= :limit', { limit: approval_limit });

    const [items, total] = await query
      .orderBy('po.created_at', 'ASC')
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
}

export default new POService();
