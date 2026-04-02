import { Inject, Injectable } from '@nestjs/common';
import { Comment } from '../../../core/domain/comment/entities/comment.domain';
import {
  type ICommentRepository,
  COMMENT_REPOSITORY,
} from '../../../core/domain/comment/repositories/comment.repository.interface';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

@Injectable()
export class GetCommentsByNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(newsId: string): Promise<Comment[]> {
    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new NewsNotFoundException(newsId);
    return this.commentRepository.findAllByNewsId(newsId);
  }
}
