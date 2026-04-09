import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { LikeController } from './like.controller';
import { ToggleLikeUseCase } from '../../application/like/use-cases/toggle-like.use-case';
import { GetLikedNewsByUserUseCase } from '../../application/like/use-cases/get-liked-news-by-user.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [LikeController],
  providers: [ToggleLikeUseCase, GetLikedNewsByUserUseCase],
})
export class LikeModule {}
