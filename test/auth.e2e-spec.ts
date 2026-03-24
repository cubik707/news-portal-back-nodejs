import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { GlobalExceptionFilter } from '../src/presentation/shared/filters/global-exception.filter';
import { AuthController } from '../src/presentation/auth/auth.controller';
import { AuthenticateUserUseCase } from '../src/application/auth/use-cases/authenticate-user.use-case';
import { RegisterUserUseCase } from '../src/application/user/use-cases/register-user.use-case';
import { VerifyTokenUseCase } from '../src/application/auth/use-cases/verify-token.use-case';
import { JwtAuthGuard } from '../src/presentation/shared/guards/jwt-auth.guard';
import { ApprovedGuard } from '../src/presentation/shared/guards/approved.guard';
import { User } from '../src/core/domain/user/entities/user.domain';
import { Email } from '../src/core/shared/value-objects/email.vo';
import { PasswordHash } from '../src/core/shared/value-objects/password-hash.vo';
import { UserRole } from '../src/core/shared/enums/user-role.enum';
import { InvalidCredentialsException } from '../src/core/domain/auth/exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../src/core/domain/user/exceptions/user-already-exists.exception';
import { ExecutionContext } from '@nestjs/common';

const makeUser = (isApproved = true) =>
  User.reconstitute({
    id: 'user-id',
    username: 'testuser',
    email: new Email('test@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved,
    roles: [UserRole.USER],
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

describe('Auth (E2E)', () => {
  let app: INestApplication;
  let authenticateUser: { execute: jest.Mock };
  let registerUser: { execute: jest.Mock };
  let verifyToken: { execute: jest.Mock };

  beforeEach(async () => {
    authenticateUser = { execute: jest.fn() };
    registerUser = { execute: jest.fn() };
    verifyToken = { execute: jest.fn() };

    const jwtUserPayload = {
      id: 'user-id',
      username: 'testuser',
      roles: [UserRole.USER],
      isApproved: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthenticateUserUseCase, useValue: authenticateUser },
        { provide: RegisterUserUseCase, useValue: registerUser },
        { provide: VerifyTokenUseCase, useValue: verifyToken },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = jwtUserPayload;
          return true;
        },
      })
      .overrideGuard(ApprovedGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /auth ────────────────────────────────────────────────────────────

  describe('POST /auth', () => {
    it('should return a token on valid credentials', async () => {
      authenticateUser.execute.mockResolvedValue({ token: 'jwt-token' });

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({ username: 'testuser', password: 'password' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ token: 'jwt-token' });
    });

    it('should return 401 on invalid credentials', async () => {
      authenticateUser.execute.mockRejectedValue(new InvalidCredentialsException());

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send({ username: 'bad', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ status: 401, message: 'Invalid credentials' });
    });

    it('should return 400 when body is missing required fields', async () => {
      const res = await request(app.getHttpServer()).post('/auth').send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /register ────────────────────────────────────────────────────────

  describe('POST /register', () => {
    const registrationBody = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      lastName: 'Last',
      firstName: 'First',
    };

    it('should register and return user wrapped in SuccessResponseDto', async () => {
      const user = makeUser(false);
      registerUser.execute.mockResolvedValue(user);

      const res = await request(app.getHttpServer()).post('/register').send(registrationBody);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: 200,
        message: 'User registered successfully',
        data: { username: 'testuser' },
      });
    });

    it('should return 409 when username is already taken', async () => {
      registerUser.execute.mockRejectedValue(new UserAlreadyExistsException('newuser'));

      const res = await request(app.getHttpServer()).post('/register').send(registrationBody);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ status: 409 });
    });

    it('should return 400 when password is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/register')
        .send({ ...registrationBody, password: '123' });

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /me ───────────────────────────────────────────────────────────────

  describe('GET /me', () => {
    it('should return the current user payload', async () => {
      const res = await request(app.getHttpServer())
        .get('/me')
        .set('Authorization', 'Bearer test-token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 200,
        data: { username: 'testuser' },
      });
    });
  });

  // ─── GET /verify-token ─────────────────────────────────────────────────────

  describe('GET /verify-token', () => {
    it('should return valid token response', async () => {
      verifyToken.execute.mockReturnValue(true);

      const res = await request(app.getHttpServer())
        .get('/verify-token')
        .set('Authorization', 'Bearer test-token');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 200, data: true });
    });
  });
});
