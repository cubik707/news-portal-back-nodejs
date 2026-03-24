import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { UserInfoOrmEntity } from './user-info.orm-entity';
import { CategoryOrmEntity } from './category.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 50, nullable: false })
  username!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ name: 'password_hash', nullable: false })
  passwordHash!: string;

  @Column({ name: 'is_approved', default: false, nullable: false })
  isApproved!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToMany(() => RoleOrmEntity, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles!: RoleOrmEntity[];

  @OneToOne(() => UserInfoOrmEntity, (info) => info.user, {
    cascade: true,
    eager: true,
  })
  userInfo!: UserInfoOrmEntity;

  @ManyToMany(() => CategoryOrmEntity)
  @JoinTable({
    name: 'user_subscriptions',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  subscribedCategories!: CategoryOrmEntity[];
}
