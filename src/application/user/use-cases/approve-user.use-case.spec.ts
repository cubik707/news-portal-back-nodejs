import { Test, TestingModule } from '@nestjs/testing';
import { ApproveUserUseCase } from './approve-user.use-case';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';

const makeUser = (isApproved = false) =>
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

describe('ApproveUserUseCase', () => {
  let useCase: ApproveUserUseCase;
  let userRepository: { findById: jest.Mock; approve: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), approve: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(ApproveUserUseCase);
  });

  it('should approve an existing user', async () => {
    const user = makeUser(false);
    const approvedUser = makeUser(true);
    userRepository.findById.mockResolvedValue(user);
    userRepository.approve.mockResolvedValue(approvedUser);

    const result = await useCase.execute('user-id');

    expect(result).toBe(approvedUser);
    expect(userRepository.approve).toHaveBeenCalledWith('user-id');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(UserNotFoundException);
    expect(userRepository.approve).not.toHaveBeenCalled();
  });
});
