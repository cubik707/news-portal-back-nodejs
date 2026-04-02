import { Test, TestingModule } from '@nestjs/testing';
import { GetCommentsByAuthorUseCase } from './get-comments-by-author.use-case';
import {
  COMMENT_REPOSITORY,
  CommentWithNewsInfo,
} from '../../../core/domain/comment/repositories/comment.repository.interface';

const makeProjection = (): CommentWithNewsInfo => ({
  id: 'comment-id',
  content: 'Test comment',
  author: {
    id: 'author-id',
    username: 'ivan.petrov',
    firstName: 'Иван',
    lastName: 'Петров',
  },
  newsId: 'news-id',
  newsTitle: 'Test News',
  createdAt: new Date(),
  updatedAt: new Date(),
  editedAt: undefined,
});

describe('GetCommentsByAuthorUseCase', () => {
  let useCase: GetCommentsByAuthorUseCase;
  let commentRepository: { findAllByAuthorId: jest.Mock };

  beforeEach(async () => {
    commentRepository = { findAllByAuthorId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCommentsByAuthorUseCase,
        { provide: COMMENT_REPOSITORY, useValue: commentRepository },
      ],
    }).compile();

    useCase = module.get(GetCommentsByAuthorUseCase);
  });

  it('returns projections for the given author', async () => {
    const projection = makeProjection();
    commentRepository.findAllByAuthorId.mockResolvedValue([projection]);

    const result = await useCase.execute('author-id');

    expect(commentRepository.findAllByAuthorId).toHaveBeenCalledWith('author-id');
    expect(result).toHaveLength(1);
    expect(result[0].newsTitle).toBe('Test News');
  });

  it('returns empty array when author has no comments', async () => {
    commentRepository.findAllByAuthorId.mockResolvedValue([]);

    const result = await useCase.execute('author-id');

    expect(result).toEqual([]);
  });
});
