import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../../core/shared/ports/password-hasher.port';
import { JWT_SERVICE } from '../../../core/shared/ports/jwt.port';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { InvalidCredentialsException } from '../../../core/domain/auth/exceptions/invalid-credentials.exception';
import { UserNotApprovedException } from '../../../core/domain/user/exceptions/user-not-approved.exception';

const makeUser = (overrides: Partial<{ isApproved: boolean }> = {}) =>
  User.reconstitute({
    id: 'user-id',
    username: 'testuser',
    email: new Email('test@example.com'),
    passwordHash: PasswordHash.fromHash('hashed-password'),
    isApproved: overrides.isApproved ?? true,
    roles: [UserRole.USER],
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let userRepository: { findByUsername: jest.Mock };
  let passwordHasher: { hash: jest.Mock; compare: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    userRepository = { findByUsername: jest.fn() };
    passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    jwtService = { sign: jest.fn(), verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PASSWORD_HASHER, useValue: passwordHasher },
        { provide: JWT_SERVICE, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get(AuthenticateUserUseCase);
  });

  it('should return a token for valid credentials', async () => {
    const user = makeUser({ isApproved: true });
    userRepository.findByUsername.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('signed-token');

    const result = await useCase.execute('testuser', 'password');

    expect(result).toEqual({ token: 'signed-token' });
    expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
    expect(passwordHasher.compare).toHaveBeenCalledWith('password', 'hashed-password');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'testuser',
      roles: [UserRole.USER],
    });
  });

  it('should throw InvalidCredentialsException when user is not found', async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(useCase.execute('unknown', 'password')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException when password is wrong', async () => {
    const user = makeUser();
    userRepository.findByUsername.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute('testuser', 'wrong-password')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw UserNotApprovedException when user is not approved', async () => {
    const user = makeUser({ isApproved: false });
    userRepository.findByUsername.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);

    await expect(useCase.execute('testuser', 'password')).rejects.toThrow(UserNotApprovedException);
  });
});
