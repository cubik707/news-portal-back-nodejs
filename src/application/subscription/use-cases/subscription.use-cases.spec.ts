import { Test, TestingModule } from '@nestjs/testing';
import { GetUserSubscriptionsUseCase } from './get-user-subscriptions.use-case';
import { SubscribeUseCase } from './subscribe.use-case';
import { UnsubscribeUseCase } from './unsubscribe.use-case';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../core/domain/category/repositories/category.repository.interface';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { Category } from '../../../core/domain/category/entities/category.domain';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

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

const makeCategory = () => Category.reconstitute({ id: 'cat-id', name: 'Tech' });

// ─── GetUserSubscriptionsUseCase ─────────────────────────────────────────────

describe('GetUserSubscriptionsUseCase', () => {
  let useCase: GetUserSubscriptionsUseCase;
  let userRepository: { findById: jest.Mock; findSubscriptions: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), findSubscriptions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserSubscriptionsUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(GetUserSubscriptionsUseCase);
  });

  it('should return user subscriptions', async () => {
    const category = makeCategory();
    userRepository.findById.mockResolvedValue(makeUser());
    userRepository.findSubscriptions.mockResolvedValue([category]);

    const result = await useCase.execute('user-id');

    expect(result.userId).toBe('user-id');
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].id).toBe('cat-id');
    expect(userRepository.findSubscriptions).toHaveBeenCalledWith('user-id');
  });

  it('should return empty categories when user has no subscriptions', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    userRepository.findSubscriptions.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result.categories).toHaveLength(0);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(UserNotFoundException);
  });
});

// ─── SubscribeUseCase ────────────────────────────────────────────────────────

describe('SubscribeUseCase', () => {
  let useCase: SubscribeUseCase;
  let userRepository: { findById: jest.Mock; addSubscription: jest.Mock };
  let categoryRepository: { findById: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), addSubscription: jest.fn() };
    categoryRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscribeUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(SubscribeUseCase);
  });

  it('should subscribe user to a category', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    categoryRepository.findById.mockResolvedValue(makeCategory());
    userRepository.addSubscription.mockResolvedValue(undefined);

    await useCase.execute('user-id', 'cat-id');

    expect(userRepository.addSubscription).toHaveBeenCalledWith('user-id', 'cat-id');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-user', 'cat-id')).rejects.toThrow(UserNotFoundException);
    expect(userRepository.addSubscription).not.toHaveBeenCalled();
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id', 'bad-cat')).rejects.toThrow(CategoryNotFoundException);
    expect(userRepository.addSubscription).not.toHaveBeenCalled();
  });
});

// ─── UnsubscribeUseCase ──────────────────────────────────────────────────────

describe('UnsubscribeUseCase', () => {
  let useCase: UnsubscribeUseCase;
  let userRepository: { findById: jest.Mock; removeSubscription: jest.Mock };

  beforeEach(async () => {
    userRepository = { findById: jest.fn(), removeSubscription: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnsubscribeUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(UnsubscribeUseCase);
  });

  it('should unsubscribe user from a category', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    userRepository.removeSubscription.mockResolvedValue(undefined);

    await useCase.execute('user-id', 'cat-id');

    expect(userRepository.removeSubscription).toHaveBeenCalledWith('user-id', 'cat-id');
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-user', 'cat-id')).rejects.toThrow(UserNotFoundException);
    expect(userRepository.removeSubscription).not.toHaveBeenCalled();
  });
});
