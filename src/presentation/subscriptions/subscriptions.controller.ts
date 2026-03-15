import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUserSubscriptionsUseCase } from '../../application/subscription/use-cases/get-user-subscriptions.use-case';
import { SubscribeUseCase } from '../../application/subscription/use-cases/subscribe.use-case';
import { UnsubscribeUseCase } from '../../application/subscription/use-cases/unsubscribe.use-case';
import { UserSubscriptionsDto } from '../../application/user/dtos/user-subscriptions.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { JwtUserPayload } from '../auth/jwt.strategy';

@Controller('user')
@UseGuards(JwtAuthGuard, ApprovedGuard)
export class SubscriptionsController {
  constructor(
    private readonly getUserSubscriptions: GetUserSubscriptionsUseCase,
    private readonly subscribe: SubscribeUseCase,
    private readonly unsubscribe: UnsubscribeUseCase,
  ) {}

  @Get('subscriptions')
  async getSubscriptions(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<UserSubscriptionsDto>> {
    const result = await this.getUserSubscriptions.execute(user.id);
    return new SuccessResponseDto(result, 'Subscriptions retrieved');
  }

  @Post('subscriptions/:subscriptionId')
  async addSubscription(
    @CurrentUser() user: JwtUserPayload,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<SuccessResponseDto<null>> {
    await this.subscribe.execute(user.id, subscriptionId);
    return new SuccessResponseDto(null, 'Subscribed successfully');
  }

  @Delete('subscriptions/:subscriptionId')
  async removeSubscription(
    @CurrentUser() user: JwtUserPayload,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<SuccessResponseDto<null>> {
    await this.unsubscribe.execute(user.id, subscriptionId);
    return new SuccessResponseDto(null, 'Unsubscribed successfully');
  }
}
