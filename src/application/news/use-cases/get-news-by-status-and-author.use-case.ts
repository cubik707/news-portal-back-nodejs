import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

@Injectable()
export class GetNewsByStatusAndAuthorUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(authorId: string, status: NewsStatus): Promise<News[]> {
    return this.newsRepository.findByStatusAndAuthor(status, authorId);
  }
}
