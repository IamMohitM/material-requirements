import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { POStatus, ApprovalStatus } from '../types/index';

@Entity('purchase_orders')
@Index(['po_number'], { unique: true })
@Index(['project_id'])
@Index(['vendor_id'])
@Index(['status'])
@Index(['approval_status'])
@Index(['created_at'])
export class PurchaseOrder {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  po_number: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  request_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'uuid' })
  quote_id: string;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date' })
  required_delivery_date: Date;

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    material_id: string;
    quantity: number;
    unit_price: number;
    gst_amount: number;
    total: number;
  }>;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approval_status: ApprovalStatus;

  @Column({ type: 'boolean', default: false })
  is_signed: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  signature_url?: string;

  @Column({ type: 'text', nullable: true })
  special_instructions?: string;

  @Column({ type: 'jsonb' })
  delivery_address: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  approval_chain?: Record<string, unknown>;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'PENDING',
    nullable: true,
  })
  delivery_status?: string; // PENDING | PARTIALLY_RECEIVED | FULLY_RECEIVED

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
