import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('comments')
export class CommentOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => NewsOrmEntity, { nullable: false })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
