import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NewsOrmEntity } from './news.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import { ApprovalStatus } from '../../../../core/shared/enums/approval-status.enum';

@Entity('news_approval')
export class NewsApprovalOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsOrmEntity, { nullable: false })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'editor_id' })
  editor!: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'submitted_to_admin_id' })
  submittedToAdmin!: UserOrmEntity | null;

  @ManyToOne(() => UserOrmEntity, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin!: UserOrmEntity | null;

  @Column({ type: 'varchar', default: ApprovalStatus.pending, nullable: false })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ name: 'seen_by_admin_at', type: 'timestamp', nullable: true })
  seenByAdminAt!: Date | null;

  @Column({ name: 'seen_by_editor_at', type: 'timestamp', nullable: true })
  seenByEditorAt!: Date | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
