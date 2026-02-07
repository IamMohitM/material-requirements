import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RequestStatus } from '../types/index';

@Entity('requests')
@Index(['project_id'])
@Index(['status'])
@Index(['requester_id'])
@Index(['created_at'])
export class Request {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  requester_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  request_number: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.DRAFT,
  })
  status: RequestStatus;

  @Column({ type: 'date' })
  requested_date: Date;

  @Column({ type: 'date' })
  required_delivery_date: Date;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    material_id: string;
    quantity: number;
    unit_price_estimate?: number;
  }>;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'jsonb', nullable: true })
  approval_chain?: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
