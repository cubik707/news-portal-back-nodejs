import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { AmendmentStatus } from '../../../../core/shared/enums/amendment-status.enum';

@Entity('amendments')
export class AmendmentOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', nullable: false })
  comment!: string;

  @Column({ type: 'varchar', default: AmendmentStatus.PENDING, nullable: false })
  status!: AmendmentStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'seen_by_user', type: 'boolean', default: false, nullable: false })
  seenByUser!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;
}
