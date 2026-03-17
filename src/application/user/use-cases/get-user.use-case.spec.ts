import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './get-user.use-case';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';

const makeUser = () =>
  User.reconstitute({
    id: 'user-id',
    username: 'testuser',
    email: new Email('test@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved: true,
    roles: [UserRole.USER],
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: { findById: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
    }).compile();

    useCase = module.get(GetUserUseCase);
  });

  it('should return a user when found', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('user-id');

    expect(result).toBe(user);
    expect(userRepository.findById).toHaveBeenCalledWith('user-id');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(UserNotFoundException);
  });
});
