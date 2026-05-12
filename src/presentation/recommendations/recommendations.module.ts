import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RecommendationsController } from './recommendations.controller';
import { GetRecommendationsUseCase } from '../../application/recommendation/use-cases/get-recommendations.use-case';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [RecommendationsController],
  providers: [GetRecommendationsUseCase],
})
export class RecommendationsModule {}
