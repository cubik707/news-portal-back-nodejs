import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('likes')
export class LikeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsOrmEntity, { nullable: false })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @Column({ name: 'news_id' })
  newsId!: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
