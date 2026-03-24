import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';

@Injectable()
export class GetAllNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
  ) {}

  async execute(): Promise<News[]> {
    return this.newsRepository.findAll();
  }
}
