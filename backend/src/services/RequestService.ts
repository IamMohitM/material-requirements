import { AppDataSource } from '@config/database';
import { Request } from '@entities/Request';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  generateRequestNumber,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { RequestStatus, IRequest, LineItem, PaginatedResponse } from '../types/index';
import { In } from 'typeorm';

export class RequestService {
  /**
   * Get repositories with lazy initialization
   */
  private getRequestRepository() {
    return AppDataSource.getRepository(Request);
  }


  

  /**
   * Create a new material request
   */
  async createRequest(
    projectId: string,
    requesterId: string,
    description: string,
    requiredDeliveryDate: Date,
    lineItems: LineItem[],
    comments?: string
  ): Promise<Request> {
    // Validate line items
    if (!lineItems || lineItems.length === 0) {
      throw new ValidationError('At least one line item is required');
    }

    for (const item of lineItems) {
      if (!item.material_id || item.quantity <= 0) {
        throw new ValidationError(
          'Each line item must have material_id and positive quantity'
        );
      }
    }

    const request = this.getRequestRepository().create({
      id: generateId(),
      project_id: projectId,
      requester_id: requesterId,
      request_number: generateRequestNumber(),
      description,
      requested_date: new Date(),
      required_delivery_date: requiredDeliveryDate,
      line_items: lineItems,
      comments,
      status: RequestStatus.DRAFT,
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
    requesterId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Request>> {
    const {
      projectId,
      status,
      requesterId,
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

    if (requesterId) {
      query.andWhere('request.requester_id = :requesterId', { requesterId });
    }

    const [items, total] = await query
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

  /**
   * Update request (only in draft status)
   */
  async updateRequest(
    id: string,
    updates: {
      description?: string;
      requiredDeliveryDate?: Date;
      lineItems?: LineItem[];
      comments?: string;
    }
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError(
        'Can only update requests in DRAFT status'
      );
    }

    if (updates.description) {
      request.description = updates.description;
    }

    if (updates.requiredDeliveryDate) {
      request.required_delivery_date = updates.requiredDeliveryDate;
    }

    if (updates.lineItems) {
      if (updates.lineItems.length === 0) {
        throw new ValidationError('At least one line item is required');
      }
      request.line_items = updates.lineItems;
    }

    if (updates.comments) {
      request.comments = updates.comments;
    }

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Submit request for approval
   */
  async submitRequest(id: string): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError(
        'Can only submit requests in DRAFT status'
      );
    }

    request.status = RequestStatus.SUBMITTED;
    request.requested_date = new Date();

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Approve request
   */
  async approveRequest(
    id: string,
    approverId: string,
    comments?: string
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestError(
        'Can only approve requests in SUBMITTED status'
      );
    }

    request.status = RequestStatus.APPROVED;
    request.approval_chain = {
      approved_by: approverId,
      approved_at: new Date(),
      comments,
    };

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Reject request
   */
  async rejectRequest(
    id: string,
    rejectorId: string,
    reason: string
  ): Promise<Request> {
    const request = await this.getRequestById(id);

    if (![RequestStatus.SUBMITTED, RequestStatus.APPROVED].includes(request.status)) {
      throw new BadRequestError(
        'Can only reject requests in SUBMITTED or APPROVED status'
      );
    }

    request.status = RequestStatus.REJECTED;
    request.approval_chain = {
      rejected_by: rejectorId,
      rejected_at: new Date(),
      reason,
    };

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Convert request to PO
   */
  async convertToPO(id: string): Promise<Request> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestError(
        'Can only convert APPROVED requests to PO'
      );
    }

    request.status = RequestStatus.CONVERTED_TO_PO;

    await this.getRequestRepository().save(request);
    return request;
  }

  /**
   * Delete request (only in draft status)
   */
  async deleteRequest(id: string): Promise<void> {
    const request = await this.getRequestById(id);

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError(
        'Can only delete requests in DRAFT status'
      );
    }

    await this.getRequestRepository().remove(request);
  }

  /**
   * Get requests by project
   */
  async getProjectRequests(
    projectId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Request>> {
    return this.getRequests({ projectId, page, pageSize });
  }

  /**
   * Count requests by status
   */
  async countRequestsByStatus(
    projectId: string
  ): Promise<Record<RequestStatus, number>> {
    const counts = await this.getRequestRepository()
      .createQueryBuilder('request')
      .where('request.project_id = :projectId', { projectId })
      .groupBy('request.status')
      .select('request.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .getRawMany();

    const result: Record<RequestStatus, number> = {
      [RequestStatus.DRAFT]: 0,
      [RequestStatus.SUBMITTED]: 0,
      [RequestStatus.APPROVED]: 0,
      [RequestStatus.REJECTED]: 0,
      [RequestStatus.CONVERTED_TO_PO]: 0,
      [RequestStatus.CANCELLED]: 0,
    };

    counts.forEach((count) => {
      result[count.status as RequestStatus] = parseInt(count.count);
    });

    return result;
  }
}

export default new RequestService();
