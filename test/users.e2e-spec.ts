import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { GlobalExceptionFilter } from '../src/presentation/shared/filters/global-exception.filter';
import { UsersController } from '../src/presentation/users/users.controller';
import { GetAllUsersUseCase } from '../src/application/user/use-cases/get-all-users.use-case';
import { GetUserUseCase } from '../src/application/user/use-cases/get-user.use-case';
import { CreateUserUseCase } from '../src/application/user/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../src/application/user/use-cases/update-user.use-case';
import { UpdateUserFieldUseCase } from '../src/application/user/use-cases/update-user-field.use-case';
import { DeleteUserUseCase } from '../src/application/user/use-cases/delete-user.use-case';
import { JwtAuthGuard } from '../src/presentation/shared/guards/jwt-auth.guard';
import { RolesGuard } from '../src/presentation/shared/guards/roles.guard';
import { ApprovedGuard } from '../src/presentation/shared/guards/approved.guard';
import { User } from '../src/core/domain/user/entities/user.domain';
import { Email } from '../src/core/shared/value-objects/email.vo';
import { PasswordHash } from '../src/core/shared/value-objects/password-hash.vo';
import { UserRole } from '../src/core/shared/enums/user-role.enum';
import { UserNotFoundException } from '../src/core/domain/user/exceptions/user-not-found.exception';

const makeUser = (id = 'user-id', roles: UserRole[] = [UserRole.USER]) =>
  User.reconstitute({
    id,
    username: 'testuser',
    email: new Email('test@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved: true,
    roles,
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

const passGuard = { canActivate: () => true };

describe('Users (E2E)', () => {
  let app: INestApplication;
  let getAllUsers: { execute: jest.Mock };
  let getUser: { execute: jest.Mock };
  let createUser: { execute: jest.Mock };
  let updateUser: { execute: jest.Mock };
  let updateUserField: { execute: jest.Mock };
  let deleteUser: { execute: jest.Mock };

  beforeEach(async () => {
    getAllUsers = { execute: jest.fn() };
    getUser = { execute: jest.fn() };
    createUser = { execute: jest.fn() };
    updateUser = { execute: jest.fn() };
    updateUserField = { execute: jest.fn() };
    deleteUser = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: GetAllUsersUseCase, useValue: getAllUsers },
        { provide: GetUserUseCase, useValue: getUser },
        { provide: CreateUserUseCase, useValue: createUser },
        { provide: UpdateUserUseCase, useValue: updateUser },
        { provide: UpdateUserFieldUseCase, useValue: updateUserField },
        { provide: DeleteUserUseCase, useValue: deleteUser },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'user-id', username: 'testuser', roles: [UserRole.ADMIN], isApproved: true };
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

  // ─── GET /users ────────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('should return all users wrapped in SuccessResponseDto', async () => {
      const users = [makeUser('1'), makeUser('2')];
      getAllUsers.execute.mockResolvedValue(users);

      const res = await request(app.getHttpServer()).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'Users retrieved' });
      expect(res.body.data).toHaveLength(2);
    });
  });

  // ─── GET /users/:id ────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      getUser.execute.mockResolvedValue(makeUser());

      const res = await request(app.getHttpServer()).get('/users/user-id');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 200,
        data: { id: 'user-id', username: 'testuser' },
      });
    });

    it('should return 404 when user is not found', async () => {
      getUser.execute.mockRejectedValue(new UserNotFoundException('bad-id'));

      const res = await request(app.getHttpServer()).get('/users/bad-id');

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ status: 404 });
    });
  });

  // ─── POST /users ───────────────────────────────────────────────────────────

  describe('POST /users', () => {
    const body = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      lastName: 'Last',
      firstName: 'First',
    };

    it('should create a user and return it', async () => {
      const user = makeUser();
      createUser.execute.mockResolvedValue(user);

      const res = await request(app.getHttpServer()).post('/users').send(body);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ status: 200, message: 'User created' });
    });

    it('should return 400 for invalid body', async () => {
      const res = await request(app.getHttpServer()).post('/users').send({ username: 'x' });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /users/:id ────────────────────────────────────────────────────────

  describe('PUT /users/:id', () => {
    const body = {
      username: 'updated',
      email: 'updated@example.com',
      password: 'newpassword',
      lastName: 'Last',
      firstName: 'First',
    };

    it('should update a user', async () => {
      const user = makeUser();
      updateUser.execute.mockResolvedValue(user);

      const res = await request(app.getHttpServer()).put('/users/user-id').send(body);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'User updated' });
    });

    it('should return 404 when user is not found', async () => {
      updateUser.execute.mockRejectedValue(new UserNotFoundException('bad-id'));

      const res = await request(app.getHttpServer()).put('/users/bad-id').send(body);

      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /users/:id ──────────────────────────────────────────────────────

  describe('PATCH /users/:id', () => {
    it('should partially update a user', async () => {
      const user = makeUser();
      updateUserField.execute.mockResolvedValue(user);

      const res = await request(app.getHttpServer())
        .patch('/users/user-id')
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'User updated' });
    });
  });

  // ─── DELETE /users/:id ─────────────────────────────────────────────────────

  describe('DELETE /users/:id', () => {
    it('should delete a user and return success', async () => {
      deleteUser.execute.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer()).delete('/users/user-id');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, message: 'User deleted' });
    });

    it('should return 404 when user is not found', async () => {
      deleteUser.execute.mockRejectedValue(new UserNotFoundException('bad-id'));

      const res = await request(app.getHttpServer()).delete('/users/bad-id');

      expect(res.status).toBe(404);
    });
  });
});
