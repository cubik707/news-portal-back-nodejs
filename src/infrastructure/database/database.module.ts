import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { UserTypeormRepository } from './typeorm/repositories/user.typeorm-repository';
import { NewsTypeormRepository } from './typeorm/repositories/news.typeorm-repository';
import { CategoryTypeormRepository } from './typeorm/repositories/category.typeorm-repository';
import { TagTypeormRepository } from './typeorm/repositories/tag.typeorm-repository';
import { NewsApprovalTypeormRepository } from './typeorm/repositories/news-approval.typeorm-repository';
import { CommentTypeormRepository } from './typeorm/repositories/comment.typeorm-repository';
import { USER_REPOSITORY } from '../../core/domain/user/repositories/user.repository.interface';
import { NEWS_REPOSITORY } from '../../core/domain/news/repositories/news.repository.interface';
import { CATEGORY_REPOSITORY } from '../../core/domain/category/repositories/category.repository.interface';
import { TAG_REPOSITORY } from '../../core/domain/tag/repositories/tag.repository.interface';
import { NEWS_APPROVAL_REPOSITORY } from '../../core/domain/news-approval/repositories/news-approval.repository.interface';
import { COMMENT_REPOSITORY } from '../../core/domain/comment/repositories/comment.repository.interface';

const ALL_ENTITIES = [
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
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: ALL_ENTITIES,
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/typeorm/migrations/*{.ts,.js}'],
      }),
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserTypeormRepository },
    { provide: NEWS_REPOSITORY, useClass: NewsTypeormRepository },
    { provide: CATEGORY_REPOSITORY, useClass: CategoryTypeormRepository },
    { provide: TAG_REPOSITORY, useClass: TagTypeormRepository },
    { provide: NEWS_APPROVAL_REPOSITORY, useClass: NewsApprovalTypeormRepository },
    { provide: COMMENT_REPOSITORY, useClass: CommentTypeormRepository },
  ],
  exports: [TypeOrmModule, USER_REPOSITORY, NEWS_REPOSITORY, CATEGORY_REPOSITORY, TAG_REPOSITORY, NEWS_APPROVAL_REPOSITORY, COMMENT_REPOSITORY],
})
export class DatabaseModule {}
