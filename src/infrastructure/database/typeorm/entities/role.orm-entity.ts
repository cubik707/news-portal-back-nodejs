import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../../../core/shared/enums/user-role.enum';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: UserRole;
}
