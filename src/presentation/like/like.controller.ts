import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { ToggleLikeUseCase } from '../../application/like/use-cases/toggle-like.use-case';
import { GetLikedNewsByUserUseCase } from '../../application/like/use-cases/get-liked-news-by-user.use-case';
import { LikeToggleResponseDto } from '../../application/like/dtos/like-toggle-response.dto';
import { NewsResponseDto } from '../../application/news/dtos/news-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';

@ApiTags('likes')
@ApiBearerAuth()
@UseGuards(ApprovedGuard)
@Controller()
export class LikeController {
  constructor(
    private readonly toggleLike: ToggleLikeUseCase,
    private readonly getLikedNewsByUser: GetLikedNewsByUserUseCase,
  ) {}

  @Post('news/:newsId/like')
  @ApiOperation({ summary: 'Toggle like on a news article' })
  @ApiParam({ name: 'newsId', type: String, description: 'UUID of the news article' })
  @ApiResponse({ status: 200, description: 'Like toggled', type: LikeToggleResponseDto })
  @ApiResponse({ status: 404, description: 'News not found' })
  async toggle(
    @Param('newsId') newsId: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<LikeToggleResponseDto>> {
    const result = await this.toggleLike.execute({ newsId, userId: user.id });
    return new SuccessResponseDto(result, 'Like toggled');
  }

  @Get('likes/my')
  @ApiOperation({ summary: 'Get all news liked by the current user' })
  @ApiResponse({ status: 200, description: 'Liked news retrieved', type: [NewsResponseDto] })
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
