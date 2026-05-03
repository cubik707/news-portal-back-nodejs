import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { GetRecommendationsUseCase } from '../../application/recommendation/use-cases/get-recommendations.use-case';
import { NewsResponseDto } from '../../application/news/dtos/news-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly getRecommendations: GetRecommendationsUseCase) {}

  @Get()
  async getPersonalFeed(
    @CurrentUser() user: JwtUserPayload,
    @Query('limit') limit = 10,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getRecommendations.execute(user.id, Number(limit));
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'Recommendations retrieved',
    );
  }
}
