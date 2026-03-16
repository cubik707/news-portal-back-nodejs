import { Test, TestingModule } from '@nestjs/testing';
import { AssignRoleUseCase } from './assign-role.use-case';
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

describe('AssignRoleUseCase', () => {
  let useCase: AssignRoleUseCase;
  let userRepository: { findById: jest.Mock; assignRole: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), assignRole: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(AssignRoleUseCase);
  });

  it('should assign a role to an existing user', async () => {
    const user = makeUser();
    const updatedUser = User.reconstitute({
      ...{ id: 'user-id', username: 'testuser', email: new Email('test@example.com'),
        passwordHash: PasswordHash.fromHash('hashed'), isApproved: true,
        roles: [UserRole.USER, UserRole.EDITOR], createdAt: new Date(),
        lastName: 'Last', firstName: 'First' },
    });
    userRepository.findById.mockResolvedValue(user);
    userRepository.assignRole.mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-id', UserRole.EDITOR);

    expect(result).toBe(updatedUser);
    expect(userRepository.assignRole).toHaveBeenCalledWith('user-id', UserRole.EDITOR);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', UserRole.EDITOR)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(userRepository.assignRole).not.toHaveBeenCalled();
  });
});
