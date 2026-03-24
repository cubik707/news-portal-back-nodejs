import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tags')
@Unique(['name'])
export class TagOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, nullable: false })
  name!: string;
}
