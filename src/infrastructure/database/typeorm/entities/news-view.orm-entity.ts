import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('news_views')
@Unique(['newsId', 'userId'])
export class NewsViewOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @Column({ name: 'news_id' })
  newsId!: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt!: Date;
}
