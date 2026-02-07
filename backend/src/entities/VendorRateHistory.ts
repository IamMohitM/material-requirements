import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('vendor_rate_history')
@Index(['vendor_id'])
@Index(['material_id'])
@Index(['vendor_id', 'material_id'])
@Index(['effective_date'])
export class VendorRateHistory {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price_per_unit: number;

  @Column({ type: 'date' })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  valid_until?: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  change_from_previous?: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  percent_change?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;
}
