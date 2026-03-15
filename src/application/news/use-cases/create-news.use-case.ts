import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

export interface CreateNewsCommand {
  title: string;
  content: string;
  image?: string;
  authorId: string;
  categoryId: string;
  tagIds?: string[];
  status?: NewsStatus;
}

@Injectable()
export class CreateNewsUseCase {
  constructor(
    @Inject(NEWS_REPOSITORY)
    private readonly newsRepository: INewsRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(command: CreateNewsCommand): Promise<News> {
    const author = await this.userRepository.findById(command.authorId);
    if (!author) throw new UserNotFoundException(command.authorId);

    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) throw new CategoryNotFoundException(command.categoryId);

    const tags = command.tagIds
      ? await Promise.all(command.tagIds.map((id) => this.tagRepository.findById(id)))
      : [];

    const news = News.create({
      title: command.title,
      content: command.content,
      image: command.image,
      author,
      category,
      tags: tags.filter(Boolean) as Awaited<ReturnType<typeof this.tagRepository.findById>>[],
      status: command.status,
    });

    return this.newsRepository.save(news as News);
  }
}
