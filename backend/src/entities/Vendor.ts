import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vendors')
@Index(['email'], { unique: true })
@Index(['is_active'])
export class Vendor {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, name: 'vendor_name' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_person?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
