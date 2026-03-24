import { Test, TestingModule } from '@nestjs/testing';
import { GetAllNewsUseCase } from './get-all-news.use-case';
import { GetNewsByIdUseCase } from './get-news-by-id.use-case';
import { GetNewsByCategoryUseCase } from './get-news-by-category.use-case';
import { GetNewsByStatusUseCase } from './get-news-by-status.use-case';
import { GetNewsByStatusAndAuthorUseCase } from './get-news-by-status-and-author.use-case';
import { GetNewsByCategoryAndStatusUseCase } from './get-news-by-category-and-status.use-case';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { Category } from '../../../core/domain/category/entities/category.domain';
import { News } from '../../../core/domain/news/entities/news.domain';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

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

const makeNews = (id = 'news-id', status = NewsStatus.published) =>
  News.reconstitute({
    id,
    title: 'News Title',
    content: 'Content',
    author: makeUser(),
    category: makeCategory(),
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  });

// ─── GetAllNewsUseCase ───────────────────────────────────────────────────────

describe('GetAllNewsUseCase', () => {
  let useCase: GetAllNewsUseCase;
  let newsRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAllNewsUseCase, { provide: NEWS_REPOSITORY, useValue: newsRepository }],
    }).compile();

    useCase = module.get(GetAllNewsUseCase);
  });

  it('should return all news', async () => {
    const news = [makeNews('1'), makeNews('2')];
    newsRepository.findAll.mockResolvedValue(news);

    const result = await useCase.execute();

    expect(result).toEqual(news);
    expect(newsRepository.findAll).toHaveBeenCalled();
  });

  it('should return an empty array when no news exists', async () => {
    newsRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});

// ─── GetNewsByIdUseCase ──────────────────────────────────────────────────────

describe('GetNewsByIdUseCase', () => {
  let useCase: GetNewsByIdUseCase;
  let newsRepository: { findById: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetNewsByIdUseCase, { provide: NEWS_REPOSITORY, useValue: newsRepository }],
    }).compile();

    useCase = module.get(GetNewsByIdUseCase);
  });

  it('should return news when found', async () => {
    const news = makeNews();
    newsRepository.findById.mockResolvedValue(news);

    const result = await useCase.execute('news-id');

    expect(result).toBe(news);
    expect(newsRepository.findById).toHaveBeenCalledWith('news-id');
  });

  it('should throw NewsNotFoundException when news does not exist', async () => {
    newsRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(NewsNotFoundException);
  });
});

// ─── GetNewsByCategoryUseCase ────────────────────────────────────────────────

describe('GetNewsByCategoryUseCase', () => {
  let useCase: GetNewsByCategoryUseCase;
  let newsRepository: { findByCategory: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findByCategory: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetNewsByCategoryUseCase, { provide: NEWS_REPOSITORY, useValue: newsRepository }],
    }).compile();

    useCase = module.get(GetNewsByCategoryUseCase);
  });

  it('should return news filtered by category', async () => {
    const news = [makeNews()];
    newsRepository.findByCategory.mockResolvedValue(news);

    const result = await useCase.execute('cat-id');

    expect(result).toEqual(news);
    expect(newsRepository.findByCategory).toHaveBeenCalledWith('cat-id');
  });
});

// ─── GetNewsByStatusUseCase ──────────────────────────────────────────────────

describe('GetNewsByStatusUseCase', () => {
  let useCase: GetNewsByStatusUseCase;
  let newsRepository: { findByStatus: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findByStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetNewsByStatusUseCase, { provide: NEWS_REPOSITORY, useValue: newsRepository }],
    }).compile();

    useCase = module.get(GetNewsByStatusUseCase);
  });

  it('should return news filtered by status', async () => {
    const news = [makeNews('1', NewsStatus.published)];
    newsRepository.findByStatus.mockResolvedValue(news);

    const result = await useCase.execute(NewsStatus.published);

    expect(result).toEqual(news);
    expect(newsRepository.findByStatus).toHaveBeenCalledWith(NewsStatus.published);
  });
});

// ─── GetNewsByStatusAndAuthorUseCase ─────────────────────────────────────────

describe('GetNewsByStatusAndAuthorUseCase', () => {
  let useCase: GetNewsByStatusAndAuthorUseCase;
  let newsRepository: { findByStatusAndAuthor: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findByStatusAndAuthor: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNewsByStatusAndAuthorUseCase,
        { provide: NEWS_REPOSITORY, useValue: newsRepository },
      ],
    }).compile();

    useCase = module.get(GetNewsByStatusAndAuthorUseCase);
  });

  it('should return news filtered by author and status', async () => {
    const news = [makeNews()];
    newsRepository.findByStatusAndAuthor.mockResolvedValue(news);

    const result = await useCase.execute('author-id', NewsStatus.published);

    expect(result).toEqual(news);
    expect(newsRepository.findByStatusAndAuthor).toHaveBeenCalledWith(
      NewsStatus.published,
      'author-id',
    );
  });
});

// ─── GetNewsByCategoryAndStatusUseCase ───────────────────────────────────────

describe('GetNewsByCategoryAndStatusUseCase', () => {
  let useCase: GetNewsByCategoryAndStatusUseCase;
  let newsRepository: { findByCategoryAndStatus: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findByCategoryAndStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNewsByCategoryAndStatusUseCase,
        { provide: NEWS_REPOSITORY, useValue: newsRepository },
      ],
    }).compile();

    useCase = module.get(GetNewsByCategoryAndStatusUseCase);
  });

  it('should return news filtered by category and status', async () => {
    const news = [makeNews()];
    newsRepository.findByCategoryAndStatus.mockResolvedValue(news);

    const result = await useCase.execute('cat-id', NewsStatus.published);

    expect(result).toEqual(news);
    expect(newsRepository.findByCategoryAndStatus).toHaveBeenCalledWith(
      'cat-id',
      NewsStatus.published,
    );
  });
});
