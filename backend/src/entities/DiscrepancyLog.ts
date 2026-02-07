import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DiscrepancyType, DiscrepancySeverity, DiscrepancyStatus } from '../types/index';

@Entity('discrepancy_logs')
@Index(['po_id'])
@Index(['status'])
@Index(['severity'])
@Index(['type'])
@Index(['flagged_at'])
export class DiscrepancyLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  po_id: string;

  @Column({ type: 'uuid', nullable: true })
  delivery_id?: string;

  @Column({ type: 'uuid', nullable: true })
  invoice_id?: string;

  @Column({
    type: 'enum',
    enum: DiscrepancyType,
  })
  type: DiscrepancyType;

  @Column({
    type: 'enum',
    enum: DiscrepancySeverity,
  })
  severity: DiscrepancySeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  flagged_by_id: string;

  @Column({ type: 'timestamp' })
  flagged_at: Date;

  @Column({
    type: 'enum',
    enum: DiscrepancyStatus,
    default: DiscrepancyStatus.OPEN,
  })
  status: DiscrepancyStatus;

  @Column({ type: 'text', nullable: true })
  resolution_notes?: string;

  @Column({ type: 'uuid', nullable: true })
  resolved_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
