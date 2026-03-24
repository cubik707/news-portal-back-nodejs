import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { SubscriptionsController } from './subscriptions.controller';
import { GetUserSubscriptionsUseCase } from '../../application/subscription/use-cases/get-user-subscriptions.use-case';
import { SubscribeUseCase } from '../../application/subscription/use-cases/subscribe.use-case';
import { UnsubscribeUseCase } from '../../application/subscription/use-cases/unsubscribe.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [SubscriptionsController],
  providers: [GetUserSubscriptionsUseCase, SubscribeUseCase, UnsubscribeUseCase],
})
export class SubscriptionsModule {}
