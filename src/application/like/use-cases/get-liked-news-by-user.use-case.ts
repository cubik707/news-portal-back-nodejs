import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type ILikeRepository,
  LIKE_REPOSITORY,
} from '../../../core/domain/like/repositories/like.repository.interface';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';

@Injectable()
export class GetLikedNewsByUserUseCase {
  constructor(
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: ILikeRepository,
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<{ news: News; commentCount: number; likeCount: number }[]> {
    const likes = await this.likeRepository.findByUser(userId);
    if (likes.length === 0) return [];

    const newsIds = likes.map((l) => l.newsId);
    const newsList = await Promise.all(newsIds.map((id) => this.newsRepository.findById(id)));
    const validNews = newsList.filter((n): n is News => n !== null);

    const validIds = validNews.map((n) => n.id);
    const [countComments, countLikes] = await Promise.all([
      Promise.all(validIds.map((id) => this.commentRepository.countByNewsId(id))),
      this.likeRepository.countsByNewsIds(validIds),
    ]);

    return validNews.map((news, i) => ({
      news,
      commentCount: countComments[i],
      likeCount: countLikes[news.id] ?? 0,
    }));
  }
}
