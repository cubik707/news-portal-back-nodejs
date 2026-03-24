import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { GlobalExceptionFilter } from '../src/presentation/shared/filters/global-exception.filter';
import { CommentsController } from '../src/presentation/comments/comments.controller';
import { GetCommentsByNewsUseCase } from '../src/application/comment/use-cases/get-comments-by-news.use-case';
import { CreateCommentUseCase } from '../src/application/comment/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from '../src/application/comment/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from '../src/application/comment/use-cases/delete-comment.use-case';
import { JwtAuthGuard } from '../src/presentation/shared/guards/jwt-auth.guard';
import { ApprovedGuard } from '../src/presentation/shared/guards/approved.guard';
import { User } from '../src/core/domain/user/entities/user.domain';
import { Email } from '../src/core/shared/value-objects/email.vo';
import { PasswordHash } from '../src/core/shared/value-objects/password-hash.vo';
import { UserRole } from '../src/core/shared/enums/user-role.enum';
import { Comment } from '../src/core/domain/comment/entities/comment.domain';
import { NewsNotFoundException } from '../src/core/domain/news/exceptions/news-not-found.exception';
import { CommentNotFoundException } from '../src/core/domain/comment/exceptions/comment-not-found.exception';
import { CommentAccessDeniedException } from '../src/core/domain/comment/exceptions/comment-access-denied.exception';

const makeUser = (id = 'user-id', roles: UserRole[] = [UserRole.USER]) =>
  User.reconstitute({
    id,
    username: 'nikitin_dev',
    email: new Email('nikitin@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved: true,
    roles,
    createdAt: new Date(),
    lastName: 'Nikitin',
    firstName: 'Ivan',
  });

const makeComment = (id = 'comment-id', authorId = 'user-id') =>
  Comment.reconstitute({
    id,
    content: 'Great article!',
    author: makeUser(authorId),
    newsId: 'news-id',
    createdAt: new Date('2026-03-24T10:00:00Z'),
    updatedAt: new Date('2026-03-24T10:00:00Z'),
    editedAt: undefined,
  });

const makeApprovedGuard = (userId = 'user-id', roles: UserRole[] = [UserRole.USER]) => ({
  canActivate: (ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    req.user = { id: userId, username: 'nikitin_dev', roles, isApproved: true };
    return true;
  },
});

describe('Comments (E2E)', () => {
  let app: INestApplication;
  let getCommentsByNews: { execute: jest.Mock };
  let createComment: { execute: jest.Mock };
  let updateComment: { execute: jest.Mock };
  let deleteComment: { execute: jest.Mock };

  async function buildApp(approvedGuardOverride: object): Promise<void> {
    getCommentsByNews = { execute: jest.fn() };
    createComment = { execute: jest.fn() };
    updateComment = { execute: jest.fn() };
    deleteComment = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: GetCommentsByNewsUseCase, useValue: getCommentsByNews },
        { provide: CreateCommentUseCase, useValue: createComment },
        { provide: UpdateCommentUseCase, useValue: updateComment },
        { provide: DeleteCommentUseCase, useValue: deleteComment },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ApprovedGuard)
      .useValue(approvedGuardOverride)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  }

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /news/:newsId/comments ─────────────────────────────────────────────

  describe('GET /news/:newsId/comments', () => {
    it('T015-1: should return 200 with empty array when no comments', async () => {
      await buildApp(makeApprovedGuard());
      getCommentsByNews.execute.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/news/news-id/comments');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'Comments retrieved', data: [] });
    });

    it('T015-2: should return 200 with comments in oldest-first order', async () => {
      await buildApp(makeApprovedGuard());
      const comments = [makeComment('c1'), makeComment('c2')];
      getCommentsByNews.execute.mockResolvedValue(comments);

      const res = await request(app.getHttpServer()).get('/news/news-id/comments');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].id).toBe('c1');
      expect(res.body.data[0]).toMatchObject({
        content: 'Great article!',
        newsId: 'news-id',
        author: { username: 'nikitin_dev', firstName: 'Ivan', lastName: 'Nikitin' },
      });
    });

    it('T015-3: should return 401 without token', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      await buildApp({
        canActivate: () => {
          throw new UnauthorizedException('No token provided');
        },
      });

      const res = await request(app.getHttpServer()).get('/news/news-id/comments');

      expect(res.status).toBe(401);
    });

    it('T015-4: should return 401 for unapproved user (ApprovedGuard)', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      await buildApp({
        canActivate: () => {
          throw new UnauthorizedException('Account is not approved');
        },
      });

      const res = await request(app.getHttpServer()).get('/news/news-id/comments');

      expect(res.status).toBe(401);
    });

    it('T015-5: should return 404 when news not found', async () => {
      await buildApp(makeApprovedGuard());
      getCommentsByNews.execute.mockRejectedValue(new NewsNotFoundException('news-id'));

      const res = await request(app.getHttpServer()).get('/news/news-id/comments');

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /news/:newsId/comments ─────────────────────────────────────────────

  describe('POST /news/:newsId/comments', () => {
    it('T019-1: should return 201 for approved user creating a comment', async () => {
      await buildApp(makeApprovedGuard());
      const comment = makeComment();
      createComment.execute.mockResolvedValue(comment);

      const res = await request(app.getHttpServer())
        .post('/news/news-id/comments')
        .send({ content: 'Great article!' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ status: 201, message: 'Comment created' });
      expect(res.body.data.id).toBe('comment-id');
    });

    it('T019-2: should return 400 for empty content', async () => {
      await buildApp(makeApprovedGuard());

      const res = await request(app.getHttpServer())
        .post('/news/news-id/comments')
        .send({ content: '' });

      expect(res.status).toBe(400);
    });

    it('T019-3: should return 400 for content exceeding 2000 characters', async () => {
      await buildApp(makeApprovedGuard());

      const res = await request(app.getHttpServer())
        .post('/news/news-id/comments')
        .send({ content: 'a'.repeat(2001) });

      expect(res.status).toBe(400);
    });

    it('T019-4: should return 401 for unapproved user', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      await buildApp({
        canActivate: () => {
          throw new UnauthorizedException('Account is not approved');
        },
      });

      const res = await request(app.getHttpServer())
        .post('/news/news-id/comments')
        .send({ content: 'test' });

      expect(res.status).toBe(401);
    });

    it('T019-5: should return 404 when news not found', async () => {
      await buildApp(makeApprovedGuard());
      createComment.execute.mockRejectedValue(new NewsNotFoundException('news-id'));

      const res = await request(app.getHttpServer())
        .post('/news/news-id/comments')
        .send({ content: 'test' });

      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /comments/:id ──────────────────────────────────────────────────────

  describe('PUT /comments/:id', () => {
    it('T023-1: should return 200 with updated comment and editedAt set', async () => {
      await buildApp(makeApprovedGuard('user-id'));
      const editedComment = Comment.reconstitute({
        id: 'comment-id',
        content: 'Updated text.',
        author: makeUser('user-id'),
        newsId: 'news-id',
        createdAt: new Date('2026-03-24T10:00:00Z'),
        updatedAt: new Date('2026-03-24T10:05:00Z'),
        editedAt: new Date('2026-03-24T10:05:00Z'),
      });
      updateComment.execute.mockResolvedValue(editedComment);

      const res = await request(app.getHttpServer())
        .put('/comments/comment-id')
        .send({ content: 'Updated text.' });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Updated text.');
      expect(res.body.data.editedAt).not.toBeNull();
      expect(res.body.message).toBe('Comment updated');
    });

    it('T023-2: should return 400 for empty content', async () => {
      await buildApp(makeApprovedGuard());

      const res = await request(app.getHttpServer())
        .put('/comments/comment-id')
        .send({ content: '' });

      expect(res.status).toBe(400);
    });

    it('T023-3: should return 403 when non-author tries to edit', async () => {
      await buildApp(makeApprovedGuard('other-user-id'));
      updateComment.execute.mockRejectedValue(new CommentAccessDeniedException());

      const res = await request(app.getHttpServer())
        .put('/comments/comment-id')
        .send({ content: 'Changed' });

      expect(res.status).toBe(403);
    });

    it('T023-4: should return 404 for unknown comment id', async () => {
      await buildApp(makeApprovedGuard());
      updateComment.execute.mockRejectedValue(new CommentNotFoundException('bad-id'));

      const res = await request(app.getHttpServer())
        .put('/comments/bad-id')
        .send({ content: 'test' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /comments/:id ───────────────────────────────────────────────────

  describe('DELETE /comments/:id', () => {
    it('T026-1: should return 200 when author deletes own comment', async () => {
      await buildApp(makeApprovedGuard('user-id'));
      deleteComment.execute.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).delete('/comments/comment-id');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'Comment deleted', data: null });
      expect(deleteComment.execute).toHaveBeenCalledWith({
        id: 'comment-id',
        requestingUserId: 'user-id',
        isAdmin: false,
      });
    });

    it('T026-2: should return 403 when non-owner non-admin tries to delete', async () => {
      await buildApp(makeApprovedGuard('other-user-id'));
      deleteComment.execute.mockRejectedValue(new CommentAccessDeniedException());

      const res = await request(app.getHttpServer()).delete('/comments/comment-id');

      expect(res.status).toBe(403);
    });

    it('T026-3: should return 404 for unknown comment id', async () => {
      await buildApp(makeApprovedGuard());
      deleteComment.execute.mockRejectedValue(new CommentNotFoundException('bad-id'));

      const res = await request(app.getHttpServer()).delete('/comments/bad-id');

      expect(res.status).toBe(404);
    });

    it("T027-1: should return 200 when admin deletes another user's comment", async () => {
      await buildApp(makeApprovedGuard('admin-id', [UserRole.ADMIN]));
      deleteComment.execute.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).delete('/comments/comment-id');

      expect(res.status).toBe(200);
      expect(deleteComment.execute).toHaveBeenCalledWith({
        id: 'comment-id',
        requestingUserId: 'admin-id',
        isAdmin: true,
      });
    });
  });
});
