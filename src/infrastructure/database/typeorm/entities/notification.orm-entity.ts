import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('notifications')
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => NewsOrmEntity, { nullable: true })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @Column({ type: 'text', nullable: false })
  message!: string;

  @Column({ name: 'is_read', default: false, nullable: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
