import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NewsOrmEntity } from './news.orm-entity';

@Entity('likes')
export class LikeOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => NewsOrmEntity, { nullable: false })
  @JoinColumn({ name: 'news_id' })
  news!: NewsOrmEntity;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
