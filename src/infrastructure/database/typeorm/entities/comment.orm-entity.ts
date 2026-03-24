import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('comments')
export class CommentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false, eager: false })
  @JoinColumn({ name: 'author_id' })
  author!: UserOrmEntity;

  @ManyToOne(() => NewsOrmEntity, { nullable: false, eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @Column({ name: 'news_id' })
  newsId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt!: Date | null;
}
