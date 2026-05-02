import { Inject, Injectable } from '@nestjs/common';
import {
  type ILikeRepository,
  LIKE_REPOSITORY,
} from '../../../core/domain/like/repositories/like.repository.interface';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { Like } from '../../../core/domain/like/entities/like.domain';
import { LikeToggleResponseDto } from '../dtos/like-toggle-response.dto';

@Injectable()
export class ToggleLikeUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: ILikeRepository,
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(params: { newsId: string; userId: string }): Promise<LikeToggleResponseDto> {
    const { newsId, userId } = params;

    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new NewsNotFoundException(newsId);

    const existing = await this.likeRepository.findByNewsAndUser(newsId, userId);

    if (existing) {
      await this.likeRepository.delete(newsId, userId);
      const likeCount = await this.likeRepository.countByNewsId(newsId);
      const dto = new LikeToggleResponseDto();
      dto.isLiked = false;
      dto.likeCount = likeCount;
      return dto;
    }

    await this.likeRepository.save(Like.create({ newsId, userId }));
    const likeCount = await this.likeRepository.countByNewsId(newsId);
    const dto = new LikeToggleResponseDto();
    dto.isLiked = true;
    dto.likeCount = likeCount;
    return dto;
  }
}
