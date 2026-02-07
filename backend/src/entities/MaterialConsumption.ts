import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('material_consumption')
@Index(['project_id'])
@Index(['material_id'])
@Index(['consumption_date'])
@Index(['project_id', 'material_id'])
export class MaterialConsumption {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @Column({ type: 'uuid', nullable: true })
  delivery_id?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  consumed_quantity: number;

  @Column({ type: 'date' })
  consumption_date: Date;

  @Column({ type: 'uuid' })
  consumed_by_id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;
}
