import { AppDataSource } from '@config/database';
import { Request } from '@entities/Request';
import { Project } from '@entities/Project';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  generateRequestNumber,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { RequestStatus, PaginatedResponse } from '../types/index';
import { In } from 'typeorm';

export class RequestService {
  /**
   * Get repositories with lazy initialization
   */
  private getRequestRepository() {
    return AppDataSource.getRepository(Request);
  }

  private getProjectRepository() {
    return AppDataSource.getRepository(Project);
  }

  /**
   * Create a new material request
   */
  async createRequest(
    projectId: string,
    submittedById: string,
    materials: Array<{ material_id: string; quantity: number; unit: string }>,
    approvalNotes?: string
  ): Promise<Request> {
    // Validate materials
    if (!materials || materials.length === 0) {
      throw new ValidationError('At least one material is required');
    }

    for (const item of materials) {
      if (!item.material_id || item.quantity <= 0 || !item.unit) {
        throw new ValidationError(
          'Each material must have material_id, positive quantity, and unit'
        );
      }
    }

    const request = this.getRequestRepository().create({
      id: generateId(),
      project_id: projectId,
      request_number: generateRequestNumber(),
      materials,
      submitted_by_id: submittedById,
      submitted_at: new Date(),
      approval_status: 'pending',
      approval_notes: approvalNotes,
      status: RequestStatus.SUBMITTED,
      is_active: true,
    });

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Get request by ID
   */
  async getRequestById(id: string): Promise<Request> {
    const request = await this.getRequestRepository().findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError('Request', id);
    }

    return request;
  }

  /**
   * Get all requests with pagination and filtering
   */
  async getRequests(options: {
    projectId?: string;
    status?: RequestStatus;
    submittedById?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Request & { project_name?: string | null }>> {
    const {
      projectId,
      status,
      submittedById,
      page = 1,
      pageSize = 20,
    } = options;

    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getRequestRepository().createQueryBuilder('request');

    if (projectId) {
      query.andWhere('request.project_id = :projectId', { projectId });
    }

    if (status) {
      query.andWhere('request.status = :status', { status });
    }

    if (submittedById) {
      query.andWhere('request.submitted_by_id = :submittedById', { submittedById });
    }

    const [items, total] = await query
      .orderBy('request.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const projectIds = Array.from(new Set(items.map((item) => item.project_id)));
    const projectNameById = new Map<string, string>();

    if (projectIds.length > 0) {
      const projects = await this.getProjectRepository().find({
        select: ['id', 'name'],
        where: { id: In(projectIds) },
      });
      projects.forEach((project) => projectNameById.set(project.id, project.name));
    }

    const enrichedItems = items.map((item) => ({
      ...item,
      project_name: projectNameById.get(item.project_id) || null,
    }));

    return {
      items: enrichedItems,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Update request materials (only in draft status)
   */
  async updateRequest(
    id: string,
    materials: Array<{ material_id: string; quantity: number; unit: string }>
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError(
        'Can only update requests in DRAFT status'
      );
    }

    if (!materials || materials.length === 0) {
      throw new ValidationError('At least one material is required');
    }

    for (const item of materials) {
      if (!item.material_id || item.quantity <= 0 || !item.unit) {
        throw new ValidationError(
          'Each material must have material_id, positive quantity, and unit'
        );
      }
    }

    request.materials = materials;

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Submit request for approval
   */
  async submitRequest(id: string, submittedById: string): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError(
        'Can only submit requests in DRAFT status'
      );
    }

    request.status = RequestStatus.SUBMITTED;
    request.submitted_by_id = submittedById;
    request.submitted_at = new Date();
    request.approval_status = 'pending';

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Approve request
   */
  async approveRequest(
    id: string,
    approverId: string,
    notes?: string
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestError(
        'Can only approve requests in SUBMITTED status'
      );
    }

    request.status = RequestStatus.APPROVED;
    request.approved_by_id = approverId;
    request.approved_at = new Date();
    request.approval_status = 'approved';
    request.approval_notes = notes;

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Reject request
   */
  async rejectRequest(
    id: string,
    reviewerId: string,
    reason: string
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (![RequestStatus.SUBMITTED, RequestStatus.APPROVED].includes(request.status)) {
      throw new BadRequestError(
        'Can only reject requests in SUBMITTED or APPROVED status'
      );
    }

    request.status = RequestStatus.REJECTED;
    request.reviewed_by_id = reviewerId;
    request.reviewed_at = new Date();
    request.approval_status = 'rejected';
    request.approval_notes = reason;

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Delete a request (soft delete via is_active flag)
   */
  async deleteRequest(id: string): Promise<void> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError('Can only delete requests in DRAFT status');
    }

    request.is_active = false;
    await this.getRequestRepository().save(request);
  }

  /**
   * Convert approved request to purchase order
   */
  async convertToPO(id: string): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestError('Can only convert APPROVED requests to PO');
    }

    request.status = RequestStatus.CONVERTED_TO_PO;
    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Get requests by project
   */
  async getRequestsByProject(
    projectId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Request & { project_name?: string | null }>> {
    return this.getRequests({ projectId, page, pageSize });
  }

  /**
   * Get requests for a specific project (alias for getRequestsByProject)
   */
  async getProjectRequests(
    projectId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Request & { project_name?: string | null }>> {
    return this.getRequests({ projectId, page, pageSize });
  }

  /**
   * Get requests for approval
   */
  async getPendingRequests(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Request & { project_name?: string | null }>> {
    return this.getRequests({ status: RequestStatus.SUBMITTED, page, pageSize });
  }

  /**
   * Search requests
   */
  async searchRequests(
    query: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Request>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const qb = this.getRequestRepository().createQueryBuilder('request');

    qb.where('request.request_number ILIKE :query', { query: `%${query}%` })
      .orWhere('request.approval_notes ILIKE :query', { query: `%${query}%` });

    const [items, total] = await qb
      .orderBy('request.created_at', 'DESC')
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

// Export singleton instance
export default new RequestService();
