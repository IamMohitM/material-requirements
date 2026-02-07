import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('brands')
@Index(['material_id'])
@Index(['vendor_id'])
@Index(['material_id', 'vendor_id'])
export class Brand {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @Column({ type: 'uuid' })
  vendor_id: string;

  @Column({ type: 'varchar', length: 200 })
  brand_name: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications?: Record<string, unknown>;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  cost_impact: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
