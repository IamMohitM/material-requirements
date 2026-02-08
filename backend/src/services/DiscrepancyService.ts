import { AppDataSource } from '@config/database';
import { DiscrepancyLog } from '@entities/DiscrepancyLog';
import { NotFoundError, ValidationError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { DiscrepancyType, DiscrepancySeverity, DiscrepancyStatus, PaginatedResponse } from '../types/index';

export class DiscrepancyService {
  /**
   * Get repositories with lazy initialization
   */
  private getDiscrepancyRepository() {
    return AppDataSource.getRepository(DiscrepancyLog);
  }


  

  /**
   * Log a discrepancy
   */
  async logDiscrepancy(
    po_id: string,
    type: DiscrepancyType,
    severity: DiscrepancySeverity,
    description: string,
    flagged_by_id: string,
    delivery_id?: string,
    invoice_id?: string
  ): Promise<DiscrepancyLog> {
    if (!po_id || !type || !severity || !description) {
      throw new ValidationError(
        'PO ID, type, severity, and description are required'
      );
    }

    const discrepancy = this.getDiscrepancyRepository().create({
      id: generateId(),
      po_id,
      delivery_id,
      invoice_id,
      type,
      severity,
      description,
      flagged_by_id,
      flagged_at: new Date(),
      status: DiscrepancyStatus.OPEN,
    });

    await this.getDiscrepancyRepository().save(discrepancy);

    // TODO: Send alerts for critical discrepancies

    return discrepancy;
  }

  /**
   * Get discrepancy by ID
   */
  async getDiscrepancyById(id: string): Promise<DiscrepancyLog> {
    const discrepancy = await this.getDiscrepancyRepository().findOne({
      where: { id },
    });

    if (!discrepancy) {
      throw new NotFoundError('Discrepancy', id);
    }

    return discrepancy;
  }

  /**
   * Get discrepancies for a PO
   */
  async getDiscrepanciesByPO(
    po_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<DiscrepancyLog>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getDiscrepancyRepository()
      .createQueryBuilder('discrepancy')
      .where('discrepancy.po_id = :po_id', { po_id })
      .orderBy('discrepancy.flagged_at', 'DESC')
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
   * Get all discrepancies with pagination and filtering
   */
  async getDiscrepancies(options: {
    status?: DiscrepancyStatus;
    severity?: DiscrepancySeverity;
    type?: DiscrepancyType;
    po_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<DiscrepancyLog>> {
    const {
      status,
      severity,
      type,
      po_id,
      page = 1,
      pageSize = 20,
    } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getDiscrepancyRepository().createQueryBuilder('discrepancy');

    if (status) {
      query.andWhere('discrepancy.status = :status', { status });
    }

    if (severity) {
      query.andWhere('discrepancy.severity = :severity', { severity });
    }

    if (type) {
      query.andWhere('discrepancy.type = :type', { type });
    }

    if (po_id) {
      query.andWhere('discrepancy.po_id = :po_id', { po_id });
    }

    const [items, total] = await query
      .orderBy('discrepancy.flagged_at', 'DESC')
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
   * Update discrepancy
   */
  async updateDiscrepancy(
    id: string,
    updates: {
      status?: DiscrepancyStatus;
      resolution_notes?: string;
      resolved_by_id?: string;
    }
  ): Promise<DiscrepancyLog> {
    const discrepancy = await this.getDiscrepancyById(id);

    if (updates.status) discrepancy.status = updates.status;
    if (updates.resolution_notes) {
      discrepancy.resolution_notes = updates.resolution_notes;
    }
    if (updates.resolved_by_id) {
      discrepancy.resolved_by_id = updates.resolved_by_id;
      discrepancy.resolved_at = new Date();
    }

    await this.getDiscrepancyRepository().save(discrepancy);
    return discrepancy;
  }

  /**
   * Resolve discrepancy
   */
  async resolveDiscrepancy(
    id: string,
    resolved_by_id: string,
    resolution_notes: string
  ): Promise<DiscrepancyLog> {
    return this.updateDiscrepancy(id, {
      status: DiscrepancyStatus.RESOLVED,
      resolution_notes,
      resolved_by_id,
    });
  }

  /**
   * Waive discrepancy
   */
  async waiveDiscrepancy(
    id: string,
    waived_by_id: string,
    reason: string
  ): Promise<DiscrepancyLog> {
    const discrepancy = await this.getDiscrepancyById(id);

    discrepancy.status = DiscrepancyStatus.WAIVED;
    discrepancy.resolved_by_id = waived_by_id;
    discrepancy.resolved_at = new Date();
    discrepancy.resolution_notes = `Waived: ${reason}`;

    await this.getDiscrepancyRepository().save(discrepancy);
    return discrepancy;
  }

  /**
   * Mark discrepancy as reviewed
   */
  async markReviewed(
    id: string,
    reviewed_by_id: string
  ): Promise<DiscrepancyLog> {
    const discrepancy = await this.getDiscrepancyById(id);

    discrepancy.status = DiscrepancyStatus.REVIEWED;
    discrepancy.resolved_by_id = reviewed_by_id;
    discrepancy.resolved_at = new Date();

    await this.getDiscrepancyRepository().save(discrepancy);
    return discrepancy;
  }

  /**
   * Get critical discrepancies requiring attention
   */
  async getCriticalDiscrepancies(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<DiscrepancyLog>> {
    return this.getDiscrepancies({
      severity: DiscrepancySeverity.CRITICAL,
      status: DiscrepancyStatus.OPEN,
      page,
      pageSize,
    });
  }

  /**
   * Get critical discrepancies for a project
   */
  async getOpenCriticalDiscrepancies(po_id: string): Promise<DiscrepancyLog[]> {
    return this.getDiscrepancyRepository().find({
      where: {
        po_id,
        severity: DiscrepancySeverity.CRITICAL,
        status: DiscrepancyStatus.OPEN,
      },
      order: { flagged_at: 'DESC' },
    });
  }

  /**
   * Get discrepancy summary/statistics
   */
  async getDiscrepancySummary(
    po_id: string
  ): Promise<{
    total: number;
    critical: number;
    warning: number;
    info: number;
    open: number;
    resolved: number;
    waived: number;
  }> {
    const discrepancies = await this.getDiscrepancyRepository().find({
      where: { po_id },
    });

    return {
      total: discrepancies.length,
      critical: discrepancies.filter(
        (d) => d.severity === DiscrepancySeverity.CRITICAL
      ).length,
      warning: discrepancies.filter(
        (d) => d.severity === DiscrepancySeverity.WARNING
      ).length,
      info: discrepancies.filter(
        (d) => d.severity === DiscrepancySeverity.INFO
      ).length,
      open: discrepancies.filter(
        (d) => d.status === DiscrepancyStatus.OPEN
      ).length,
      resolved: discrepancies.filter(
        (d) => d.status === DiscrepancyStatus.RESOLVED
      ).length,
      waived: discrepancies.filter(
        (d) => d.status === DiscrepancyStatus.WAIVED
      ).length,
    };
  }
}

export default new DiscrepancyService();
