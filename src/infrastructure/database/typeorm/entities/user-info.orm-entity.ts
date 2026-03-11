import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('users_info')
export class UserInfoOrmEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @OneToOne(() => UserOrmEntity, (user) => user.userInfo)
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ name: 'last_name', length: 100, nullable: false })
  lastName!: string;

  @Column({ name: 'first_name', length: 100, nullable: false })
  firstName!: string;

  @Column({ length: 100, nullable: true })
  surname!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string;

  @Column({ length: 100, nullable: true })
  position!: string;

  @Column({ length: 100, nullable: true })
  department!: string;
}
