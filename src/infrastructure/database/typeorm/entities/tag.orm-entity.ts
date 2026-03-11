import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tags')
@Unique(['name'])
export class TagOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, nullable: false })
  name!: string;
}
