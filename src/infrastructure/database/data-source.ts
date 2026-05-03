import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserOrmEntity } from './typeorm/entities/user.orm-entity';
import { UserInfoOrmEntity } from './typeorm/entities/user-info.orm-entity';
import { RoleOrmEntity } from './typeorm/entities/role.orm-entity';
import { CategoryOrmEntity } from './typeorm/entities/category.orm-entity';
import { TagOrmEntity } from './typeorm/entities/tag.orm-entity';
import { NewsOrmEntity } from './typeorm/entities/news.orm-entity';
import { CommentOrmEntity } from './typeorm/entities/comment.orm-entity';
import { LikeOrmEntity } from './typeorm/entities/like.orm-entity';
import { NotificationOrmEntity } from './typeorm/entities/notification.orm-entity';
import { UserNotificationOrmEntity } from './typeorm/entities/user-notification.orm-entity';
import { NewsApprovalOrmEntity } from './typeorm/entities/news-approval.orm-entity';
import { NewsViewOrmEntity } from './typeorm/entities/news-view.orm-entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    UserOrmEntity,
    UserInfoOrmEntity,
    RoleOrmEntity,
    CategoryOrmEntity,
    TagOrmEntity,
    NewsOrmEntity,
    CommentOrmEntity,
    LikeOrmEntity,
    NotificationOrmEntity,
    UserNotificationOrmEntity,
    NewsApprovalOrmEntity,
    NewsViewOrmEntity,
  ],
  migrations: [__dirname + '/typeorm/migrations/*{.ts,.js}'],
  synchronize: false,
});
