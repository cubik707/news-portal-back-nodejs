import { Inject, Injectable } from '@nestjs/common';
import { News } from '../../../core/domain/news/entities/news.domain';
import {
  type INewsRepository,
  NEWS_REPOSITORY,
} from '../../../core/domain/news/repositories/news.repository.interface';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import {
  type ITagRepository,
  TAG_REPOSITORY,
} from '../../../core/domain/tag/repositories/tag.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';
export interface CreateNewsCommand {
  title: string;
  content: string;
  image?: string;
  authorId: string;
  categoryId: string;
  tags?: string[];
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

    const tags = await this.tagRepository.findOrCreateByNames(command.tags ?? []);

    const news = News.create({
      title: command.title,
      content: command.content,
      image: command.image,
      author,
      category,
      tags,
    });

    return this.newsRepository.save(news);
  }
}
