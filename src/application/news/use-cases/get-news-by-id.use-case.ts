import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';
import {
  type ILikeRepository,
  LIKE_REPOSITORY,
} from '../../../core/domain/like/repositories/like.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

@Injectable()
export class GetNewsByIdUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY) private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY) private readonly commentRepository: ICommentRepository,
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: ILikeRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ news: News; commentCount: number; likeCount: number; isLikedByCurrentUser: boolean }> {
    const news = await this.newsRepository.findById(id);
    if (!news) throw new NewsNotFoundException(id);

    const [commentCount, likeCount, likedIds] = await Promise.all([
      this.commentRepository.countByNewsId(id),
      this.likeRepository.countByNewsId(id),
      this.likeRepository.findLikedNewsIds(userId, [id]),
    ]);

    return {
      news,
      commentCount,
      likeCount,
      isLikedByCurrentUser: likedIds.includes(id),
    };
  }
}
