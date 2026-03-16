import { Test, TestingModule } from '@nestjs/testing';
import { DeleteNewsUseCase } from './delete-news.use-case';
import { NEWS_REPOSITORY } from '../../../core/domain/news/repositories/news.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { Category } from '../../../core/domain/category/entities/category.domain';
import { News } from '../../../core/domain/news/entities/news.domain';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';
import { NewsNotFoundException } from '../../../core/domain/news/exceptions/news-not-found.exception';

const makeNews = () =>
  News.reconstitute({
    id: 'news-id',
    title: 'Title',
    content: 'Content',
    author: User.reconstitute({
      id: 'author-id',
      username: 'editor',
      email: new Email('editor@example.com'),
      passwordHash: PasswordHash.fromHash('hashed'),
      isApproved: true,
      roles: [UserRole.EDITOR],
      createdAt: new Date(),
      lastName: 'Last',
      firstName: 'First',
    }),
    category: Category.reconstitute({ id: 'cat-id', name: 'Tech' }),
    status: NewsStatus.draft,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  });

describe('DeleteNewsUseCase', () => {
  let useCase: DeleteNewsUseCase;
  let newsRepository: { findById: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    newsRepository = { findById: jest.fn(), delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteNewsUseCase,
        { provide: NEWS_REPOSITORY, useValue: newsRepository },
      ],
    }).compile();

    useCase = module.get(DeleteNewsUseCase);
  });

  it('should delete existing news', async () => {
    newsRepository.findById.mockResolvedValue(makeNews());
    newsRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('news-id');

    expect(newsRepository.delete).toHaveBeenCalledWith('news-id');
  });

  it('should throw NewsNotFoundException when news does not exist', async () => {
    newsRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(NewsNotFoundException);
    expect(newsRepository.delete).not.toHaveBeenCalled();
  });
});
