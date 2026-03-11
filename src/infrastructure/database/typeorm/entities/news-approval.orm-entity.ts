import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NewsOrmEntity } from './news.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import { ApprovalStatus } from '../../../../core/shared/enums/approval-status.enum';

@Entity('news_approval')
export class NewsApprovalOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => NewsOrmEntity, { nullable: false })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'editor_id' })
  editor!: UserOrmEntity;

  @Column({
    type: 'varchar',
    default: ApprovalStatus.pending,
    nullable: false,
  })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comment!: string;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt!: Date;
}
