import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AuditStatus } from '../types/index';

@Entity('audit_logs')
@Index(['aggregate_id'])
@Index(['aggregate_type'])
@Index(['actor_id'])
@Index(['timestamp'])
@Index(['aggregate_type', 'created_at'])
export class AuditLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  aggregate_id: string;

  @Column({ type: 'varchar', length: 100 })
  aggregate_type: string;

  @Column({ type: 'varchar', length: 100 })
  event_type: string;

  @Column({ type: 'uuid' })
  actor_id: string;

  @Column({ type: 'varchar', length: 50 })
  actor_role: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'jsonb', nullable: true })
  old_state?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  new_state?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  change_summary?: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({
    type: 'enum',
    enum: AuditStatus,
    default: AuditStatus.SUCCESS,
  })
  status: AuditStatus;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @CreateDateColumn()
  created_at: Date;
}
