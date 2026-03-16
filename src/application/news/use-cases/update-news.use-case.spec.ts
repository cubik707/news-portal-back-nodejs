import { Test, TestingModule } from '@nestjs/testing';
import { UpdateNewsUseCase } from './update-news.use-case';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
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
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';
import { TagNotFoundException } from '../../../core/domain/tag/exceptions/tag-not-found.exception';

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

const makeCategory = (id = 'cat-id') => Category.reconstitute({ id, name: 'Tech' });
const makeTag = (id = 'tag-id') => Tag.reconstitute({ id, name: 'NestJS' });

const makeNews = () =>
  News.reconstitute({
    id: 'news-id',
    title: 'Original Title',
    content: 'Original content',
    author: makeUser(),
    category: makeCategory(),
    status: NewsStatus.draft,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  });

describe('UpdateNewsUseCase', () => {
  let useCase: UpdateNewsUseCase;
  let newsRepository: { findById: jest.Mock; update: jest.Mock };
  let categoryRepository: { findById: jest.Mock };
  let tagRepository: { findByIds: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findById: jest.fn(), update: jest.fn() };
    categoryRepository = { findById: jest.fn() };
    tagRepository = { findByIds: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateNewsUseCase,
        { provide: NEWS_REPOSITORY, useValue: newsRepository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
        { provide: TAG_REPOSITORY, useValue: tagRepository },
      ],
    }).compile();

    useCase = module.get(UpdateNewsUseCase);
  });

  it('should update news title', async () => {
    const news = makeNews();
    const updated = makeNews();
    newsRepository.findById.mockResolvedValue(news);
    newsRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ id: 'news-id', title: 'New Title' });

    expect(result).toBe(updated);
    expect(newsRepository.update).toHaveBeenCalledWith('news-id', expect.any(News));
  });

  it('should update news category when categoryId provided', async () => {
    const news = makeNews();
    const newCat = makeCategory('new-cat-id');
    newsRepository.findById.mockResolvedValue(news);
    categoryRepository.findById.mockResolvedValue(newCat);
    newsRepository.update.mockResolvedValue(news);

    await useCase.execute({ id: 'news-id', categoryId: 'new-cat-id' });

    expect(categoryRepository.findById).toHaveBeenCalledWith('new-cat-id');
  });

  it('should update news tags when tagIds provided', async () => {
    const news = makeNews();
    const tag = makeTag();
    newsRepository.findById.mockResolvedValue(news);
    tagRepository.findByIds.mockResolvedValue([tag]);
    newsRepository.update.mockResolvedValue(news);

    await useCase.execute({ id: 'news-id', tagIds: ['tag-id'] });

    expect(tagRepository.findByIds).toHaveBeenCalledWith(['tag-id']);
  });

  it('should throw NewsNotFoundException when news does not exist', async () => {
    newsRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'bad-id', title: 'New Title' })).rejects.toThrow(
      NewsNotFoundException,
    );
  });

  it('should throw CategoryNotFoundException when new category does not exist', async () => {
    newsRepository.findById.mockResolvedValue(makeNews());
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'news-id', categoryId: 'bad-cat' })).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it('should throw TagNotFoundException when a new tag does not exist', async () => {
    newsRepository.findById.mockResolvedValue(makeNews());
    tagRepository.findByIds.mockResolvedValue([]); // requested 1, found 0

    await expect(useCase.execute({ id: 'news-id', tagIds: ['missing-tag'] })).rejects.toThrow(
      TagNotFoundException,
    );
  });
});
