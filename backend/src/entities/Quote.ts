import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { QuoteStatus } from '../types/index';

@Entity('quotes')
@Index(['request_id'])
@Index(['vendor_id'])
@Index(['status'])
export class Quote {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  request_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  quote_number: string;

  @Column({ type: 'date' })
  quote_date: Date;

  @Column({ type: 'date' })
  valid_until: Date;

  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.SENT,
  })
  status: QuoteStatus;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'jsonb' })
  line_items: Array<{
    material_id: string;
    quantity: number;
    unit_price: number;
    delivery_time: number;
  }>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', nullable: true })
  submitted_by_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date;

  @Column({ type: 'boolean', default: true })
  is_active?: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
