import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { InvoiceStatus, InvoiceMatchingStatus } from '../types/index';

@Entity('invoices')
@Index(['invoice_number'], { unique: true })
@Index(['po_id'])
@Index(['vendor_id'])
@Index(['status'])
@Index(['matching_status'])
@Index(['invoice_date'])
export class Invoice {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  invoice_number: string;

  @Column({ type: 'uuid' })
  po_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    material_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    brand_invoiced?: string;
    brand_received?: string;
    brand_ordered?: string;
    variance_info?: {
      price_variance_pct: number;
      qty_variance: number;
      brand_match_status: string;
    };
  }>;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.SUBMITTED,
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: InvoiceMatchingStatus,
    default: InvoiceMatchingStatus.UNMATCHED,
  })
  matching_status: InvoiceMatchingStatus;

  @Column({ type: 'jsonb', nullable: true })
  match_analysis?: {
    matched_deliveries: string[];
    matched_qty: number;
    unmatched_qty: number;
    discrepancy_count: number;
    critical_count: number;
    warning_count: number;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  submitted_by_id: string;

  @Column({ type: 'timestamp' })
  submitted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  approved_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at?: Date;

  @Column({ type: 'text', nullable: true })
  approval_notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
