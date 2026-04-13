import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import type { INewsRepository } from '../../../core/domain/news/repositories/news.repository.interface';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { News } from '../../../core/domain/news/entities/news.domain';

@Injectable()
export class PublishApprovedNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(newsId: string, editorId: string): Promise<News> {
    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new NewsNotFoundException(newsId);

    if (news.author.id !== editorId) {
      throw new ForbiddenException('You can only publish your own articles');
    }

    news.publish(); // throws if status !== approved
    await this.newsRepository.update(news.id, news);
    return news;
  }
}
