import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';
import { TagOrmEntity } from './tag.orm-entity';
import { NewsStatus } from '../../../../core/shared/enums/news-status.enum';

@Entity('news')
export class NewsOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ nullable: true })
  image!: string;

  @ManyToOne(() => UserOrmEntity, { nullable: false, eager: false })
  @JoinColumn({ name: 'author_id' })
  author!: UserOrmEntity;

  @ManyToOne(() => CategoryOrmEntity, { nullable: false, eager: false })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryOrmEntity;

  @Column({ type: 'varchar', default: NewsStatus.draft, nullable: false })
  status!: NewsStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt!: Date;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => TagOrmEntity)
  @JoinTable({
    name: 'news_tags',
    joinColumn: { name: 'news_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags!: TagOrmEntity[];
}
