import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { News } from '../../../core/domain/news/entities/news.domain';
import { type INewsRepository, NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { type ICommentRepository, COMMENT_REPOSITORY } from '../../../core/domain/comment/repositories/comment.repository.interface';
import { type ILikeRepository, LIKE_REPOSITORY } from '../../../core/domain/like/repositories/like.repository.interface';

interface MlRecommendResponse {
  user_id: string;
  news_ids: string[];
  model: string;
}

export type RecommendedNewsItem = {
  news: News;
  commentCount: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
};

@Injectable()
export class GetRecommendationsUseCase {
  private readonly logger = new Logger(GetRecommendationsUseCase.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(NEWS_REPOSITORY) private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY) private readonly commentRepository: ICommentRepository,
    @Inject(LIKE_REPOSITORY) private readonly likeRepository: ILikeRepository,
  ) {}

  async execute(userId: string, limit = 10): Promise<RecommendedNewsItem[]> {
    const mlUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');

    let newsIds: string[] = [];
    try {
      const response = await firstValueFrom(
        this.httpService.get<MlRecommendResponse>(
          `${mlUrl}/recommend/${userId}`,
          { params: { limit } },
        ),
      );
      newsIds = response.data.news_ids;
    } catch (err) {
      this.logger.warn(`ML service unavailable, returning empty recommendations: ${err}`);
      return [];
    }

    if (newsIds.length === 0) return [];

    const newsList = await this.newsRepository.findByIds(newsIds);
    if (newsList.length === 0) return [];

    const ids = newsList.map((n) => n.id);
    const [commentCounts, likeCounts, likedIds] = await Promise.all([
      Promise.all(ids.map((id) => this.commentRepository.countByNewsId(id))),
      this.likeRepository.countsByNewsIds(ids),
      this.likeRepository.findLikedNewsIds(userId, ids),
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
