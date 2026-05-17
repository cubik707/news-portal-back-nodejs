import { Inject, Injectable } from '@nestjs/common';
import {
  type INewsViewRepository,
  NEWS_VIEW_REPOSITORY,
} from '../../../core/domain/news-view/repositories/news-view.repository.interface';

@Injectable()
export class TrackNewsViewUseCase {
  constructor(
    @Inject(NEWS_VIEW_REPOSITORY)
    private readonly newsViewRepository: INewsViewRepository,
  ) {}

  async execute(newsId: string, userId: string): Promise<void> {
    await this.newsViewRepository.upsert(newsId, userId);
  }
}
