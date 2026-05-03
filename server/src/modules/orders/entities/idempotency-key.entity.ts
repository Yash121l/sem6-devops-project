import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string;

  @Index('idx_idempotency_keys_order_id')
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
