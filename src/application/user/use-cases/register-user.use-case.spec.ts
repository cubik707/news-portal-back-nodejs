import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { USER_REPOSITORY } from '../../../core/domain/user/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../../core/shared/ports/password-hasher.port';
import { EmailService } from '../../../infrastructure/email/email.service';
import { User } from '../../../core/domain/user/entities/user.domain';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import { UserRole } from '../../../core/shared/enums/user-role.enum';
import { UserAlreadyExistsException } from '../../../core/domain/user/exceptions/user-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../../core/domain/user/exceptions/user-email-already-exists.exception';

const makeSavedUser = () =>
  User.reconstitute({
    id: 'new-user-id',
    username: 'newuser',
    email: new Email('new@example.com'),
    passwordHash: PasswordHash.fromHash('hashed'),
    isApproved: false,
    roles: [UserRole.USER],
    createdAt: new Date(),
    lastName: 'Last',
    firstName: 'First',
  });

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: {
    findByUsername: jest.Mock;
    findByEmail: jest.Mock;
    save: jest.Mock;
  };
  let passwordHasher: { hash: jest.Mock; compare: jest.Mock };
  let emailService: { sendHtmlMessage: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    passwordHasher = { hash: jest.fn(), compare: jest.fn() };
    emailService = { sendHtmlMessage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PASSWORD_HASHER, useValue: passwordHasher },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
  });

  const command = {
    username: 'newuser',
    email: 'new@example.com',
    password: 'password123',
    lastName: 'Last',
    firstName: 'First',
  };

  it('should register a user and send a confirmation email', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    const saved = makeSavedUser();
    userRepository.save.mockResolvedValue(saved);
    emailService.sendHtmlMessage.mockResolvedValue(undefined);

    const result = await useCase.execute(command);

    expect(result).toBe(saved);
    expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.save).toHaveBeenCalled();
    expect(emailService.sendHtmlMessage).toHaveBeenCalledWith(
      'new@example.com',
      'Registration Successful',
      expect.stringContaining('First'),
    );
  });

  it('should throw UserAlreadyExistsException when username is taken', async () => {
    userRepository.findByUsername.mockResolvedValue(makeSavedUser());

    await expect(useCase.execute(command)).rejects.toThrow(UserAlreadyExistsException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw UserEmailAlreadyExistsException when email is taken', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(makeSavedUser());

    await expect(useCase.execute(command)).rejects.toThrow(UserEmailAlreadyExistsException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
