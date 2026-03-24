import type { Server } from 'http';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { GlobalExceptionFilter } from '../src/presentation/shared/filters/global-exception.filter';
import { NewsController } from '../src/presentation/news/news.controller';
import { GetAllNewsUseCase } from '../src/application/news/use-cases/get-all-news.use-case';
import { GetNewsByIdUseCase } from '../src/application/news/use-cases/get-news-by-id.use-case';
import { GetNewsByCategoryUseCase } from '../src/application/news/use-cases/get-news-by-category.use-case';
import { GetNewsByStatusUseCase } from '../src/application/news/use-cases/get-news-by-status.use-case';
import { GetNewsByStatusAndAuthorUseCase } from '../src/application/news/use-cases/get-news-by-status-and-author.use-case';
import { GetNewsByCategoryAndStatusUseCase } from '../src/application/news/use-cases/get-news-by-category-and-status.use-case';
import { CreateNewsUseCase } from '../src/application/news/use-cases/create-news.use-case';
import { UpdateNewsUseCase } from '../src/application/news/use-cases/update-news.use-case';
import { DeleteNewsUseCase } from '../src/application/news/use-cases/delete-news.use-case';
import { JwtAuthGuard } from '../src/presentation/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../src/presentation/shared/guards/roles.guard';
import { ApprovedGuard } from '../src/presentation/shared/guards/approved.guard';
import { User } from '../src/core/domain/user/entities/user.domain';
import { Email } from '../src/core/shared/value-objects/email.vo';
import { PasswordHash } from '../src/core/shared/value-objects/password-hash.vo';
import { UserRole } from '../src/core/shared/enums/user-role.enum';
import { Category } from '../src/core/domain/category/entities/category.domain';
import { News } from '../src/core/domain/news/entities/news.domain';
import { NewsStatus } from '../src/core/shared/enums/news-status.enum';
import { NewsNotFoundException } from '../src/core/domain/news/exceptions/news-not-found.exception';

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

const passGuard = { canActivate: () => true };

describe('News (E2E)', () => {
  let app: INestApplication;
  let getAllNews: { execute: jest.Mock };
  let getNewsById: { execute: jest.Mock };
  let getNewsByCategory: { execute: jest.Mock };
  let getNewsByStatus: { execute: jest.Mock };
  let getNewsByStatusAndAuthor: { execute: jest.Mock };
  let getNewsByCategoryAndStatus: { execute: jest.Mock };
  let createNews: { execute: jest.Mock };
  let updateNews: { execute: jest.Mock };
  let deleteNews: { execute: jest.Mock };

  beforeEach(async () => {
    getAllNews = { execute: jest.fn() };
    getNewsById = { execute: jest.fn() };
    getNewsByCategory = { execute: jest.fn() };
    getNewsByStatus = { execute: jest.fn() };
    getNewsByStatusAndAuthor = { execute: jest.fn() };
    getNewsByCategoryAndStatus = { execute: jest.fn() };
    createNews = { execute: jest.fn() };
    updateNews = { execute: jest.fn() };
    deleteNews = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: GetAllNewsUseCase, useValue: getAllNews },
        { provide: GetNewsByIdUseCase, useValue: getNewsById },
        { provide: GetNewsByCategoryUseCase, useValue: getNewsByCategory },
        { provide: GetNewsByStatusUseCase, useValue: getNewsByStatus },
        { provide: GetNewsByStatusAndAuthorUseCase, useValue: getNewsByStatusAndAuthor },
        { provide: GetNewsByCategoryAndStatusUseCase, useValue: getNewsByCategoryAndStatus },
        { provide: CreateNewsUseCase, useValue: createNews },
        { provide: UpdateNewsUseCase, useValue: updateNews },
        { provide: DeleteNewsUseCase, useValue: deleteNews },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<{ user: unknown }>();
          req.user = {
            id: 'author-id',
            username: 'editor',
            roles: [UserRole.EDITOR],
            isApproved: true,
          };
          return true;
        },
      })
      .overrideGuard(ApprovedGuard)
      .useValue(passGuard)
      .overrideGuard(RolesGuard)
      .useValue(passGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /news ─────────────────────────────────────────────────────────────

  describe('GET /news', () => {
    it('should return all news', async () => {
      getAllNews.execute.mockResolvedValue([
        { news: makeNews('1'), commentCount: 0 },
        { news: makeNews('2'), commentCount: 0 },
      ]);

      const res = await request(app.getHttpServer() as Server).get('/news');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'News retrieved' });
      expect((res.body as { data: unknown[] }).data).toHaveLength(2);
    });
  });

  // ─── GET /news/status ──────────────────────────────────────────────────────

  describe('GET /news/status', () => {
    it('should return news filtered by status', async () => {
      getNewsByStatus.execute.mockResolvedValue([makeNews()]);

      const res = await request(app.getHttpServer() as Server)
        .get('/news/status')
        .query({ status: 'published' });

      expect(res.status).toBe(200);
      expect((res.body as { data: unknown[] }).data).toHaveLength(1);
      expect(getNewsByStatus.execute).toHaveBeenCalledWith(NewsStatus.published);
    });
  });

  // ─── GET /news/category/:categoryId ───────────────────────────────────────

  describe('GET /news/category/:categoryId', () => {
    it('should return news filtered by category', async () => {
      getNewsByCategory.execute.mockResolvedValue([makeNews()]);

      const res = await request(app.getHttpServer() as Server).get('/news/category/cat-id');

      expect(res.status).toBe(200);
      expect(getNewsByCategory.execute).toHaveBeenCalledWith('cat-id');
    });
  });

  // ─── GET /news/category/:categoryId/status ─────────────────────────────────

  describe('GET /news/category/:categoryId/status', () => {
    it('should return news filtered by category and status', async () => {
      getNewsByCategoryAndStatus.execute.mockResolvedValue([makeNews()]);

      const res = await request(app.getHttpServer() as Server)
        .get('/news/category/cat-id/status')
        .query({ status: 'published' });

      expect(res.status).toBe(200);
      expect(getNewsByCategoryAndStatus.execute).toHaveBeenCalledWith(
        'cat-id',
        NewsStatus.published,
      );
    });
  });

  // ─── GET /news/author/:authorId/status ─────────────────────────────────────

  describe('GET /news/author/:authorId/status', () => {
    it('should return news filtered by author and status', async () => {
      getNewsByStatusAndAuthor.execute.mockResolvedValue([makeNews()]);

      const res = await request(app.getHttpServer() as Server)
        .get('/news/author/author-id/status')
        .query({ status: 'published' });

      expect(res.status).toBe(200);
      expect(getNewsByStatusAndAuthor.execute).toHaveBeenCalledWith(
        'author-id',
        NewsStatus.published,
      );
    });
  });

  // ─── GET /news/:id ─────────────────────────────────────────────────────────

  describe('GET /news/:id', () => {
    it('should return news by id', async () => {
      getNewsById.execute.mockResolvedValue({ news: makeNews(), commentCount: 0 });

      const res = await request(app.getHttpServer() as Server).get('/news/news-id');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 200,
        data: { id: 'news-id', title: 'News Title' },
      });
    });

    it('should return 404 when news is not found', async () => {
      getNewsById.execute.mockRejectedValue(new NewsNotFoundException('bad-id'));

      const res = await request(app.getHttpServer() as Server).get('/news/bad-id');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ status: 404 });
    });
  });

  // ─── POST /news ────────────────────────────────────────────────────────────

  describe('POST /news', () => {
    const body = {
      title: 'New Article',
      content: 'Some content',
      categoryId: 'cat-id',
    };

    it('should create news and return it', async () => {
      createNews.execute.mockResolvedValue(makeNews());

      const res = await request(app.getHttpServer() as Server)
        .post('/news')
        .send(body);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ status: 200, message: 'News created' });
      expect(createNews.execute).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Article', authorId: 'author-id' }),
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/news')
        .send({ title: 'Only title' });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /news/:id ─────────────────────────────────────────────────────────

  describe('PUT /news/:id', () => {
    it('should update news and return it', async () => {
      updateNews.execute.mockResolvedValue(makeNews());

      const res = await request(app.getHttpServer() as Server)
        .put('/news/news-id')
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'News updated' });
    });

    it('should return 404 when news is not found', async () => {
      updateNews.execute.mockRejectedValue(new NewsNotFoundException('bad-id'));

      const res = await request(app.getHttpServer() as Server)
        .put('/news/bad-id')
        .send({ title: 'x' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /news/:id ──────────────────────────────────────────────────────

  describe('DELETE /news/:id', () => {
    it('should delete news and return success', async () => {
      deleteNews.execute.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer() as Server).delete('/news/news-id');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'News deleted' });
    });

    it('should return 404 when news is not found', async () => {
      deleteNews.execute.mockRejectedValue(new NewsNotFoundException('bad-id'));

      const res = await request(app.getHttpServer() as Server).delete('/news/bad-id');

      expect(res.status).toBe(404);
    });
  });
});
