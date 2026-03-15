import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

@Injectable()
export class GetNewsByIdUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(id: string): Promise<News> {
    const news = await this.newsRepository.findById(id);
    if (!news) throw new NewsNotFoundException(id);
    return news;
  }
}
