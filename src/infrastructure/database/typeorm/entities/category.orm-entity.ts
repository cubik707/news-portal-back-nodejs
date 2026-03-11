import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news_categories')
export class CategoryOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, nullable: false })
  name!: string;
}
