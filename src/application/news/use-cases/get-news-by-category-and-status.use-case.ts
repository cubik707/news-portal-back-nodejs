import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

@Injectable()
export class GetNewsByCategoryAndStatusUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(categoryId: string, status: NewsStatus): Promise<News[]> {
    return this.newsRepository.findByCategoryAndStatus(categoryId, status);
  }
}
