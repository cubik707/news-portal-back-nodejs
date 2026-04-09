import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { ToggleLikeUseCase } from '../../application/like/use-cases/toggle-like.use-case';
import { GetLikedNewsByUserUseCase } from '../../application/like/use-cases/get-liked-news-by-user.use-case';
import { LikeToggleResponseDto } from '../../application/like/dtos/like-toggle-response.dto';
import { NewsResponseDto } from '../../application/news/dtos/news-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';

@UseGuards(ApprovedGuard)
@Controller()
export class LikeController {
  constructor(
    private readonly toggleLike: ToggleLikeUseCase,
    private readonly getLikedNewsByUser: GetLikedNewsByUserUseCase,
  ) {}

  @Post('news/:newsId/like')
  async toggle(
    @Param('newsId') newsId: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<LikeToggleResponseDto>> {
    const result = await this.toggleLike.execute({ newsId, userId: user.id });
    return new SuccessResponseDto(result, 'Like toggled');
  }

  @Get('likes/my')
  async myLikedNews(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getLikedNewsByUser.execute(user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, true),
      ),
      'Liked news retrieved',
    );
  }
}
