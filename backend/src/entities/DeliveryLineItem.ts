import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
// Condition enum handled as string, not imported from types

@Entity('delivery_line_items')
@Index(['delivery_id'])
@Index(['material_id'])
@Index(['po_line_item_id'])
export class DeliveryLineItem {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  delivery_id: string;

  @Column({ type: 'varchar', length: 100 })
  po_line_item_id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity_ordered: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity_received: number;

  @Column({ type: 'varchar', length: 20, default: 'good' })
  condition: 'good' | 'damaged';

  @Column({ type: 'varchar', length: 200, nullable: true })
  brand_received?: string;

  @Column({ type: 'uuid', nullable: true })
  brand_id?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;
}
