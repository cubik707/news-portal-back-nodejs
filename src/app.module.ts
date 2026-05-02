import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './presentation/shared/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { EmailModule } from './infrastructure/email/email.module';
import { FileStorageModule } from './infrastructure/file-storage/file-storage.module';
import { AuthModule } from './presentation/auth/auth.module';
import { UsersModule } from './presentation/users/users.module';
import { AdminModule } from './presentation/admin/admin.module';
import { NewsModule } from './presentation/news/news.module';
import { CategoriesModule } from './presentation/categories/categories.module';
import { TagsModule } from './presentation/tags/tags.module';
import { SubscriptionsModule } from './presentation/subscriptions/subscriptions.module';
import { FilesModule } from './presentation/files/files.module';
import { NewsApprovalsModule } from './presentation/news-approvals/news-approvals.module';
import { CommentsModule } from './presentation/comments/comments.module';
import { LikeModule } from './presentation/like/like.module';
import { ApprovalsGatewayModule } from './presentation/approvals-gateway/approvals-gateway.module';
import { GlobalExceptionFilter } from './presentation/shared/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    DatabaseModule,
    EmailModule,
    FileStorageModule,
    AuthModule,
    UsersModule,
    AdminModule,
    NewsModule,
    CategoriesModule,
    TagsModule,
    SubscriptionsModule,
    FilesModule,
    NewsApprovalsModule,
    CommentsModule,
    LikeModule,
    ApprovalsGatewayModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
