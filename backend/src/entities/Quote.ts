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
  validity_date: Date;

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

  @Column({ type: 'varchar', length: 100 })
  payment_terms: string;

  @Column({ type: 'varchar', length: 500 })
  delivery_location: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  document_url?: string;

  @Column({ type: 'timestamp', nullable: true })
  received_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
