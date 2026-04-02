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
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

@Injectable()
export class GetNewsByStatusUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(status: NewsStatus): Promise<{ news: News; commentCount: number }[]> {
    const newsList = await this.newsRepository.findByStatus(status);
    return Promise.all(
      newsList.map(async (news) => ({
        news,
        commentCount: await this.commentRepository.countByNewsId(news.id),
      })),
    );
  }
}
