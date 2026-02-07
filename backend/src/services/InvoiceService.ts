import { AppDataSource } from '@config/database';
import { Invoice } from '@entities/Invoice';
import { PurchaseOrder } from '@entities/PurchaseOrder';
import { Delivery } from '@entities/Delivery';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import {
  InvoiceStatus,
  InvoiceMatchingStatus,
  PaginatedResponse,
  POStatus,
  DiscrepancyType,
  DiscrepancySeverity,
} from '../types/index';
import { discrepancyService } from './index';

interface MatchResult {
  matching_status: InvoiceMatchingStatus;
  match_analysis: {
    matched_deliveries: string[];
    matched_qty: number;
    unmatched_qty: number;
    discrepancy_count: number;
    critical_count: number;
    warning_count: number;
  };
  discrepancies: Array<{
    type: DiscrepancyType;
    severity: DiscrepancySeverity;
    description: string;
  }>;
}

export class InvoiceService {
  private invoiceRepository = AppDataSource.getRepository(Invoice);
  private poRepository = AppDataSource.getRepository(PurchaseOrder);
  private deliveryRepository = AppDataSource.getRepository(Delivery);

  // Default tolerances
  private PRICE_TOLERANCE_PCT = 5; // 5%
  private QUANTITY_TOLERANCE = 0; // 0%

  /**
   * Create an invoice with validation
   */
  async createInvoice(
    po_id: string,
    vendor_id: string,
    invoice_number: string,
    invoice_date: Date,
    due_date: Date,
    line_items: any[],
    total_amount: number,
    submitted_by_id: string,
    notes?: string
  ): Promise<Invoice> {
    if (!po_id || !vendor_id || !invoice_number || !line_items.length) {
      throw new ValidationError(
        'PO ID, Vendor ID, invoice number, and line items are required'
      );
    }

    // Validate due date >= invoice date
    if (due_date < invoice_date) {
      throw new ValidationError('Due date cannot be before invoice date');
    }

    // Check invoice number uniqueness
    const existingInvoice = await this.invoiceRepository.findOne({
      where: { invoice_number },
    });

    if (existingInvoice) {
      throw new ValidationError(
        `Invoice with number ${invoice_number} already exists`
      );
    }

    // Fetch and validate PO
    const po = await this.poRepository.findOne({ where: { id: po_id } });
    if (!po) {
      throw new NotFoundError('PurchaseOrder', po_id);
    }

    if (po.status === POStatus.CANCELLED) {
      throw new BadRequestError('Cannot create invoice for cancelled PO');
    }

    if (po.status !== POStatus.DELIVERED) {
      throw new BadRequestError(
        'PO must be in DELIVERED status to invoice. Current status: ' +
          po.status
      );
    }

    // Validate line items
    const validationErrors = this.validateLineItems(po.line_items, line_items);
    if (validationErrors.length > 0) {
      throw new ValidationError(
        `Line item validation errors: ${validationErrors.join(', ')}`
      );
    }

    // Validate total amount
    const calculatedTotal = line_items.reduce(
      (sum: number, item: any) => sum + (item.total_amount || 0),
      0
    );
    if (Math.abs(calculatedTotal - total_amount) > 0.01) {
      throw new ValidationError(
        `Invoice total ${total_amount} does not match line items sum ${calculatedTotal}`
      );
    }

    const invoice = this.invoiceRepository.create({
      id: generateId(),
      invoice_number,
      po_id,
      vendor_id,
      invoice_date,
      due_date,
      line_items,
      total_amount,
      status: InvoiceStatus.SUBMITTED,
      matching_status: InvoiceMatchingStatus.UNMATCHED,
      submitted_by_id,
      submitted_at: new Date(),
      notes,
    });

    await this.invoiceRepository.save(invoice);

    // Trigger automatic 3-way matching
    await this.performThreeWayMatch(invoice.id);

    return this.getInvoiceById(invoice.id);
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice', id);
    }

    return invoice;
  }

  /**
   * Get invoices for a PO
   */
  async getInvoicesByPO(
    po_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Invoice>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.po_id = :po_id', { po_id })
      .orderBy('invoice.invoice_date', 'DESC')
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
   * Get all invoices with pagination
   */
  async getInvoices(options: {
    status?: InvoiceStatus;
    matching_status?: InvoiceMatchingStatus;
    vendor_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Invoice>> {
    const {
      status,
      matching_status,
      vendor_id,
      page = 1,
      pageSize = 20,
    } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (status) {
      query.andWhere('invoice.status = :status', { status });
    }

    if (matching_status) {
      query.andWhere('invoice.matching_status = :matching_status', {
        matching_status,
      });
    }

    if (vendor_id) {
      query.andWhere('invoice.vendor_id = :vendor_id', { vendor_id });
    }

    const [items, total] = await query
      .orderBy('invoice.invoice_date', 'DESC')
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
   * Update invoice (only in SUBMITTED/REJECTED status)
   */
  async updateInvoice(
    id: string,
    updates: {
      notes?: string;
      line_items?: any[];
      total_amount?: number;
    }
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    // Can only edit in SUBMITTED or REJECTED status
    if (
      invoice.status !== InvoiceStatus.SUBMITTED &&
      invoice.status !== InvoiceStatus.REJECTED
    ) {
      throw new BadRequestError(
        `Cannot update invoice in ${invoice.status} status`
      );
    }

    if (updates.notes) invoice.notes = updates.notes;
    if (updates.line_items) invoice.line_items = updates.line_items as any;
    if (updates.total_amount) invoice.total_amount = updates.total_amount;

    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  /**
   * Delete invoice (only in SUBMITTED status)
   */
  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== InvoiceStatus.SUBMITTED) {
      throw new BadRequestError(
        `Cannot delete invoice in ${invoice.status} status`
      );
    }

    await this.invoiceRepository.remove(invoice);
  }

  /**
   * Perform 3-way matching (Quantity, Price, Brand, Timing)
   */
  async performThreeWayMatch(invoice_id: string): Promise<MatchResult> {
    const invoice = await this.getInvoiceById(invoice_id);
    const po = await this.poRepository.findOne({
      where: { id: invoice.po_id },
    });

    if (!po) {
      throw new NotFoundError('PurchaseOrder', invoice.po_id);
    }

    // Get all deliveries for this PO
    const deliveries = await this.deliveryRepository.find({
      where: { po_id: invoice.po_id },
    });

    const discrepancies: Array<{
      type: DiscrepancyType;
      severity: DiscrepancySeverity;
      description: string;
    }> = [];
    const matchedDeliveries: string[] = [];
    let matchedQty = 0;
    let unmatchedQty = 0;

    // Process each invoice line item
    for (const invoiceLineItem of invoice.line_items) {
      const poLineItem = po.line_items.find(
        (pli: any) => pli.material_id === invoiceLineItem.material_id
      );

      if (!poLineItem) {
        discrepancies.push({
          type: DiscrepancyType.QUANTITY_MISMATCH,
          severity: DiscrepancySeverity.CRITICAL,
          description: `Material ${invoiceLineItem.material_id} on invoice not found in PO`,
        });
        continue;
      }

      // 1. QUANTITY MATCHING
      let deliveredQty = 0;
      let matchedDeliveryIds: string[] = [];

      for (const delivery of deliveries) {
        const deliveryLineItem = delivery.line_items.find(
          (li: any) => li.material_id === invoiceLineItem.material_id
        );
        if (deliveryLineItem) {
          const itemDeliveredQty =
            (deliveryLineItem.quantity_good || 0) +
            (deliveryLineItem.quantity_damaged || 0);
          deliveredQty += itemDeliveredQty;
          matchedDeliveryIds.push(delivery.id);
        }
      }

      if (invoiceLineItem.quantity > deliveredQty) {
        // Over-invoiced
        discrepancies.push({
          type: DiscrepancyType.QUANTITY_MISMATCH,
          severity: DiscrepancySeverity.CRITICAL,
          description: `Invoiced qty ${invoiceLineItem.quantity} exceeds delivered qty ${deliveredQty} for material ${invoiceLineItem.material_id}`,
        });
        unmatchedQty += invoiceLineItem.quantity;
      } else if (invoiceLineItem.quantity < deliveredQty) {
        // Partial invoice
        discrepancies.push({
          type: DiscrepancyType.QUANTITY_MISMATCH,
          severity: DiscrepancySeverity.WARNING,
          description: `Invoiced qty ${invoiceLineItem.quantity} less than delivered qty ${deliveredQty} for material ${invoiceLineItem.material_id}`,
        });
        matchedQty += invoiceLineItem.quantity;
      } else {
        matchedQty += invoiceLineItem.quantity;
      }

      // 2. PRICE MATCHING
      const priceVariancePct =
        ((invoiceLineItem.unit_price - poLineItem.unit_price) /
          poLineItem.unit_price) *
        100;

      if (Math.abs(priceVariancePct) > this.PRICE_TOLERANCE_PCT) {
        discrepancies.push({
          type: DiscrepancyType.PRICE_MISMATCH,
          severity: DiscrepancySeverity.WARNING,
          description: `Price variance ${priceVariancePct.toFixed(2)}% exceeds tolerance for material ${invoiceLineItem.material_id}`,
        });
      }

      // 3. BRAND MATCHING
      if (
        invoiceLineItem.brand_invoiced &&
        invoiceLineItem.brand_received &&
        invoiceLineItem.brand_invoiced !== invoiceLineItem.brand_received
      ) {
        discrepancies.push({
          type: DiscrepancyType.BRAND_MISMATCH,
          severity: DiscrepancySeverity.WARNING,
          description: `Brand mismatch: invoiced ${invoiceLineItem.brand_invoiced}, received ${invoiceLineItem.brand_received}`,
        });
      }

      // Track matched deliveries
      matchedDeliveryIds.forEach((id) => {
        if (!matchedDeliveries.includes(id)) {
          matchedDeliveries.push(id);
        }
      });
    }

    // 4. TIMING MATCHING
    if (invoice.invoice_date < new Date(deliveries[0]?.delivery_date || Date.now())) {
      discrepancies.push({
        type: DiscrepancyType.TIMING_MISMATCH,
        severity: DiscrepancySeverity.CRITICAL,
        description: `Invoice date ${invoice.invoice_date} is before earliest delivery date`,
      });
    }

    // 5. QUALITY ISSUES
    for (const delivery of deliveries) {
      for (const lineItem of delivery.line_items) {
        if ((lineItem.quantity_damaged || 0) > 0) {
          discrepancies.push({
            type: DiscrepancyType.QUALITY_ISSUE,
            severity: DiscrepancySeverity.INFO,
            description: `${lineItem.quantity_damaged} damaged units for material ${lineItem.material_id}`,
          });
        }
      }
    }

    // Determine matching status
    const criticalCount = discrepancies.filter(
      (d) => d.severity === DiscrepancySeverity.CRITICAL
    ).length;
    const warningCount = discrepancies.filter(
      (d) => d.severity === DiscrepancySeverity.WARNING
    ).length;

    let matchingStatus: InvoiceMatchingStatus;
    if (criticalCount > 0) {
      matchingStatus = InvoiceMatchingStatus.MISMATCHED;
    } else if (warningCount > 0 || unmatchedQty > 0) {
      matchingStatus = InvoiceMatchingStatus.PARTIAL_MATCHED;
    } else {
      matchingStatus = InvoiceMatchingStatus.FULLY_MATCHED;
    }

    // Update invoice with match analysis
    invoice.matching_status = matchingStatus;
    invoice.match_analysis = {
      matched_deliveries: matchedDeliveries,
      matched_qty: matchedQty,
      unmatched_qty: unmatchedQty,
      discrepancy_count: discrepancies.length,
      critical_count: criticalCount,
      warning_count: warningCount,
    };

    await this.invoiceRepository.save(invoice);

    // Auto-log discrepancies
    for (const discrepancy of discrepancies) {
      await discrepancyService.logDiscrepancy(
        invoice.po_id,
        discrepancy.type,
        discrepancy.severity,
        discrepancy.description,
        invoice.submitted_by_id,
        matchedDeliveries[0],
        invoice.id
      );
    }

    return {
      matching_status: matchingStatus,
      match_analysis: invoice.match_analysis,
      discrepancies,
    };
  }

  /**
   * Approve invoice (blocking on critical discrepancies)
   */
  async approveInvoice(
    id: string,
    approved_by_id: string,
    approval_notes?: string
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.REJECTED) {
      throw new BadRequestError('Cannot approve rejected invoice');
    }

    if (invoice.status === InvoiceStatus.APPROVED) {
      throw new BadRequestError('Invoice is already approved');
    }

    // Check for critical discrepancies
    if (invoice.match_analysis?.critical_count && invoice.match_analysis.critical_count > 0) {
      throw new BadRequestError(
        `Cannot approve invoice with ${invoice.match_analysis.critical_count} critical discrepancies. Resolve first.`
      );
    }

    invoice.status = InvoiceStatus.APPROVED;
    invoice.approved_by_id = approved_by_id;
    invoice.approved_at = new Date();
    invoice.approval_notes = approval_notes;

    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  /**
   * Reject invoice
   */
  async rejectInvoice(
    id: string,
    rejected_by_id: string,
    reason: string
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    invoice.status = InvoiceStatus.REJECTED;
    invoice.notes = `${invoice.notes || ''}\nRejection reason: ${reason}`.trim();

    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  /**
   * Validate line items against PO
   */
  private validateLineItems(
    poLineItems: any[],
    invoiceLineItems: any[]
  ): string[] {
    const errors: string[] = [];

    for (const invItem of invoiceLineItems) {
      const poItem = poLineItems.find(
        (p: any) => p.material_id === invItem.material_id
      );

      if (!poItem) {
        errors.push(`Material ${invItem.material_id} not in PO`);
      } else if (invItem.quantity <= 0) {
        errors.push(`Invalid quantity for material ${invItem.material_id}`);
      } else if (invItem.unit_price <= 0) {
        errors.push(`Invalid unit price for material ${invItem.material_id}`);
      }
    }

    return errors;
  }
}

export default new InvoiceService();
