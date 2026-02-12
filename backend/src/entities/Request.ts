import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RequestStatus } from '../types/index';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'archived';

@Entity('requests')
@Index(['project_id'])
@Index(['status'])
@Index(['created_at'])
export class Request {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  request_number: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.DRAFT,
  })
  status: RequestStatus;

  @Column({ type: 'jsonb', default: '[]' })
  materials: Array<{
    material_id: string;
    material_name?: string | null;
    quantity: number;
    unit: string;
  }>;

  @Column({ type: 'uuid', nullable: true })
  submitted_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  approved_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'pending' })
  approval_status?: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  approval_notes?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
