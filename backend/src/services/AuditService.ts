import { AppDataSource } from '@config/database';
import { AuditLog } from '@entities/AuditLog';
import { generateId, getPaginationParams, calculateTotalPages } from '@utils/helpers';
import { PaginatedResponse, AuditStatus } from '../types/index';

export interface AuditLogEntry {
  actor_id: string;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  old_state?: Record<string, any>;
  new_state?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  /**
   * Get repositories with lazy initialization
   */
  private getAuditRepository() {
    return AppDataSource.getRepository(AuditLog);
  }


  

  /**
   * Log an action
   */
  async logAction(
    actor_id: string,
    event_type: string,
    aggregate_type: string,
    aggregate_id: string,
    old_state?: any,
    new_state?: any,
    ip_address?: string,
    user_agent?: string
  ): Promise<AuditLog> {
    const auditLog = this.getAuditRepository().create({
      id: generateId(),
      actor_id,
      event_type,
      aggregate_type,
      aggregate_id,
      old_state,
      new_state,
      actor_role: 'unknown',
      ip_address,
      user_agent,
      timestamp: new Date(),
      status: AuditStatus.SUCCESS,
    } as any);

    await this.getAuditRepository().save(auditLog);
    return auditLog as any as AuditLog;
  }

  /**
   * Get audit logs for entity
   */
  async getAuditLogsForEntity(
    entity_type: string,
    entity_id: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<AuditLog>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getAuditRepository()
      .createQueryBuilder('audit')
      .where('audit.entity_type = :entity_type', { entity_type })
      .andWhere('audit.entity_id = :entity_id', { entity_id })
      .orderBy('audit.timestamp', 'DESC')
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
   * Get audit logs by user
   */
  async getAuditLogsByUser(
    user_id: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<AuditLog>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getAuditRepository()
      .createQueryBuilder('audit')
      .where('audit.user_id = :user_id', { user_id })
      .orderBy('audit.timestamp', 'DESC')
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
   * Get audit logs by action
   */
  async getAuditLogsByAction(
    action: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<AuditLog>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getAuditRepository()
      .createQueryBuilder('audit')
      .where('audit.action = :action', { action })
      .orderBy('audit.timestamp', 'DESC')
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
   * Get audit logs with date range
   */
  async getAuditLogsByDateRange(
    start_date: Date,
    end_date: Date,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResponse<AuditLog>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getAuditRepository()
      .createQueryBuilder('audit')
      .where('audit.timestamp >= :start_date', { start_date })
      .andWhere('audit.timestamp <= :end_date', { end_date })
      .orderBy('audit.timestamp', 'DESC')
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
   * Generate audit compliance report
   */
  async generateComplianceReport(
    entity_type: string,
    entity_id: string
  ): Promise<{
    entity_type: string;
    entity_id: string;
    created_by: string;
    created_at: Date;
    modifications: Array<{
      timestamp: Date;
      modified_by: string;
      action: string;
      changes: any;
    }>;
    final_state: any;
  }> {
    const logs = await this.getAuditRepository().find({
      where: { aggregate_type: entity_type, aggregate_id: entity_id },
      order: { timestamp: 'ASC' },
    });

    if (logs.length === 0) {
      return {
        entity_type,
        entity_id,
        created_by: '',
        created_at: new Date(),
        modifications: [],
        final_state: null,
      };
    }

    const creationLog = logs[0];
    const modifications = logs.slice(1).map((log) => ({
      timestamp: log.timestamp,
      modified_by: log.actor_id,
      action: log.event_type,
      changes: { before: log.old_state, after: log.new_state },
    }));

    const finalState = logs[logs.length - 1].new_state;

    return {
      entity_type,
      entity_id,
      created_by: creationLog.actor_id,
      created_at: creationLog.timestamp,
      modifications,
      final_state: finalState,
    };
  }
}

export default new AuditService();
