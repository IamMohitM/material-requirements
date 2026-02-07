import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('materials')
@Index(['category'])
@Index(['is_active'])
@Index(['name'])
export class Material {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  unit_of_measure: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'integer', nullable: true })
  min_stock?: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  standard_cost?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
