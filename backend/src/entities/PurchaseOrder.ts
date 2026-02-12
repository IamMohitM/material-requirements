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

  @Column({ type: 'uuid', nullable: true, default: null })
  quote_id?: string | null;

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

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  total_amount?: number;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    material_id: string;
    material_name?: string;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_percent?: number;
    gst_amount: number;
    total: number;
  }>;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approval_status: ApprovalStatus;

  @Column({ type: 'uuid', nullable: true })
  first_approver_id?: string;

  @Column({ type: 'text', nullable: true })
  first_approver_notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  first_approved_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  final_approver_id?: string;

  @Column({ type: 'text', nullable: true })
  final_approver_notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  final_approved_at?: Date;

  @Column({ type: 'varchar', length: 50, default: 'PENDING', nullable: true })
  delivery_status?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_active?: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
