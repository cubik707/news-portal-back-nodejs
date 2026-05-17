import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RecommendationsController } from './recommendations.controller';
import { GetRecommendationsUseCase } from '../../application/recommendation/use-cases/get-recommendations.use-case';
import * as http from 'http';

@Module({
  imports: [
    DatabaseModule,
    HttpModule.register({
      timeout: 5000,
      httpAgent: new http.Agent({ keepAlive: false }),
    }),
  ],
  controllers: [RecommendationsController],
  providers: [GetRecommendationsUseCase],
})
export class RecommendationsModule {}
