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
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

@Injectable()
export class GetNewsByStatusAndAuthorUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY) private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY) private readonly commentRepository: ICommentRepository,
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: ILikeRepository,
  ) {}

  async execute(
    authorId: string,
    status: NewsStatus,
    userId: string,
  ): Promise<{ news: News; commentCount: number; likeCount: number; isLikedByCurrentUser: boolean }[]> {
    const newsList = await this.newsRepository.findByStatusAndAuthor(status, authorId);
    if (newsList.length === 0) return [];

    const newsIds = newsList.map((n) => n.id);
    const [commentCounts, likeCounts, likedIds] = await Promise.all([
      Promise.all(newsIds.map((id) => this.commentRepository.countByNewsId(id))),
      this.likeRepository.countsByNewsIds(newsIds),
      this.likeRepository.findLikedNewsIds(userId, newsIds),
    ]);

    const likedSet = new Set(likedIds);
    return newsList.map((news, i) => ({
      news,
      commentCount: commentCounts[i],
      likeCount: likeCounts[news.id] ?? 0,
      isLikedByCurrentUser: likedSet.has(news.id),
    }));
  }
}
