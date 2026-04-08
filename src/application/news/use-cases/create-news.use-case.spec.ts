import { Test, TestingModule } from '@nestjs/testing';
import { CreateNewsUseCase } from './create-news.use-case';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../core/domain/category/repositories/category.repository.interface';
import { TAG_REPOSITORY } from '../../../core/domain/tag/repositories/tag.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { Category } from '../../../core/domain/category/entities/category.domain';
import { Tag } from '../../../core/domain/tag/entities/tag.domain';
import { News } from '../../../core/domain/news/entities/news.domain';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

const makeUser = () =>
  User.reconstitute({
    id: 'author-id',
    username: 'editor',
    email: new Email('editor@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved: true,
    roles: [UserRole.EDITOR],
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

const makeCategory = () => Category.reconstitute({ id: 'cat-id', name: 'Tech' });
const makeTag = () => Tag.reconstitute({ id: 'tag-id', name: 'NestJS' });

const makeNews = (author: User, category: Category, tags: Tag[]) =>
  News.reconstitute({
    id: 'news-id',
    title: 'Test News',
    content: 'Test content',
    author,
    category,
    status: NewsStatus.draft,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags,
  });

describe('CreateNewsUseCase', () => {
  let useCase: CreateNewsUseCase;
  let newsRepository: { save: jest.Mock };
  let userRepository: { findById: jest.Mock };
  let categoryRepository: { findById: jest.Mock };
  let tagRepository: { findOrCreateByNames: jest.Mock };

  beforeEach(async () => {
    newsRepository = { save: jest.fn() };
    userRepository = { findById: jest.fn() };
    categoryRepository = { findById: jest.fn() };
    tagRepository = { findOrCreateByNames: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNewsUseCase,
        { provide: NEWS_REPOSITORY, useValue: newsRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(CreateNewsUseCase);
  });

  it('should create news with valid data and no tags', async () => {
    const author = makeUser();
    const category = makeCategory();
    const news = makeNews(author, category, []);

    userRepository.findById.mockResolvedValue(author);
    categoryRepository.findById.mockResolvedValue(category);
    tagRepository.findOrCreateByNames.mockResolvedValue([]);
    newsRepository.save.mockResolvedValue(news);

    const result = await useCase.execute({
      title: 'Test News',
      content: 'Test content',
      authorId: 'author-id',
      categoryId: 'cat-id',
    });

    expect(result).toBe(news);
    expect(newsRepository.save).toHaveBeenCalled();
  });

  it('should create news with tags', async () => {
    const author = makeUser();
    const category = makeCategory();
    const tag = makeTag();
    const news = makeNews(author, category, [tag]);

    userRepository.findById.mockResolvedValue(author);
    categoryRepository.findById.mockResolvedValue(category);
    tagRepository.findOrCreateByNames.mockResolvedValue([tag]);
    newsRepository.save.mockResolvedValue(news);

    const result = await useCase.execute({
      title: 'Test News',
      content: 'Test content',
      authorId: 'author-id',
      categoryId: 'cat-id',
      tags: ['NestJS'],
    });

    expect(result).toBe(news);
    expect(tagRepository.findOrCreateByNames).toHaveBeenCalledWith(['NestJS']);
  });

  it('should throw UserNotFoundException when author does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ title: 'T', content: 'C', authorId: 'bad-id', categoryId: 'cat-id' }),
    ).rejects.toThrow(UserNotFoundException);
    expect(newsRepository.save).not.toHaveBeenCalled();
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ title: 'T', content: 'C', authorId: 'author-id', categoryId: 'bad-id' }),
    ).rejects.toThrow(CategoryNotFoundException);
    expect(newsRepository.save).not.toHaveBeenCalled();
  });

});
