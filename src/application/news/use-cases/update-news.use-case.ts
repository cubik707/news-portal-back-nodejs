import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import {
  type ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import { Category } from '../../../core/domain/category/entities/category.domain';

export interface UpdateNewsCommand {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  categoryId?: string;
  tags?: string[];
  status?: NewsStatus;
}

@Injectable()
export class UpdateNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(command: UpdateNewsCommand): Promise<News> {
    const news = await this.newsRepository.findById(command.id);
    if (!news) throw new NewsNotFoundException(command.id);

    let category: Category | undefined;
    if (command.categoryId) {
      const found = await this.categoryRepository.findById(command.categoryId);
      if (!found) throw new CategoryNotFoundException(command.categoryId);
      category = found;
    }

    let tags: Tag[] | undefined;
    if (command.tags) {
      tags = await this.tagRepository.findOrCreateByNames(command.tags);
    }

    news.updateContent({
      title: command.title,
      content: command.content,
      image: command.image,
      category,
      tags,
      status: command.status,
    });

    return this.newsRepository.update(command.id, news);
  }
}
