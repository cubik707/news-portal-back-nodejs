import { Inject, Injectable } from '@nestjs/common';
import {
  INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

@Injectable()
export class DeleteNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const news = await this.newsRepository.findById(id);
    if (!news) throw new NewsNotFoundException(id);
    await this.newsRepository.delete(id);
  }
}
