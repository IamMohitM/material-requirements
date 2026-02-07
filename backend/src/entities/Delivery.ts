import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DeliveryStatus } from '../types/index';

@Entity('deliveries')
@Index(['po_id'])
@Index(['status'])
@Index(['delivery_date'])
@Index(['received_by_id'])
export class Delivery {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  delivery_number: string;

  @Column({ type: 'uuid' })
  po_id: string;

  @Column({ type: 'date' })
  delivery_date: Date;

  @Column({ type: 'uuid' })
  received_by_id: string;

  @Column({ type: 'timestamp' })
  received_at: Date;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PARTIAL,
  })
  status: DeliveryStatus;

  @Column({ type: 'varchar', length: 200, nullable: true })
  delivery_location?: string;

  @Column({ type: 'jsonb', nullable: true })
  location_details?: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  photos?: Array<{ url: string; description: string; uploaded_at: Date }>;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    po_line_item_id: string;
    material_id: string;
    quantity_ordered: number;
    quantity_good: number;
    quantity_damaged: number;
    damage_notes?: string;
    brand_received?: string;
    brand_ordered?: string;
    quality_score?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  match_analysis?: {
    matched_invoices: string[];
    total_invoiced: number;
    total_delivered: number;
    discrepancy_count: number;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
