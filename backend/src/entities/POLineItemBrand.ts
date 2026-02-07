import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('po_line_item_brands')
@Index(['po_id'])
@Index(['material_id'])
@Index(['po_id', 'material_id'])
export class POLineItemBrand {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  po_id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @Column({ type: 'uuid', nullable: true })
  brand_id?: string;

  @Column({ type: 'timestamp', nullable: true })
  selected_date?: Date;

  @Column({ type: 'uuid', nullable: true })
  selected_by_id?: string;

  @Column({ type: 'date', nullable: true })
  confirmed_delivery_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
