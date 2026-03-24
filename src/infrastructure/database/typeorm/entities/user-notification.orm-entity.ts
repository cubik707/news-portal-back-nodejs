import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { NotificationOrmEntity } from './notification.orm-entity';

@Entity('user_notifications')
export class UserNotificationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => UserOrmEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @ManyToOne(() => NotificationOrmEntity, { nullable: false })
  @JoinColumn({ name: 'notification_id' })
  notification!: NotificationOrmEntity;

  @Column({ name: 'is_read', default: false, nullable: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
