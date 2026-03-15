import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
