import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news_categories')
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, nullable: false })
  name!: string;
}
