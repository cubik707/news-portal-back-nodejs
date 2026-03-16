import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../../core/domain/user/exceptions/user-already-exists.exception';
import { UserEmailAlreadyExistsException } from '../../../core/domain/user/exceptions/user-email-already-exists.exception';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../core/shared/ports/password-hasher.port';

export interface CreateUserCommand {
  username: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const existingByUsername = await this.userRepository.findByUsername(command.username);
    if (existingByUsername) {
      throw new UserAlreadyExistsException(command.username);
    }

    const existingByEmail = await this.userRepository.findByEmail(command.email);
    if (existingByEmail) {
      throw new UserEmailAlreadyExistsException(command.email);
    }

    const hash = await this.passwordHasher.hash(command.password);

    const user = User.create({
      username: command.username,
      email: new Email(command.email),
      passwordHash: PasswordHash.fromHash(hash),
      lastName: command.lastName,
      firstName: command.firstName,
      surname: command.surname,
      position: command.position,
      department: command.department,
    });

    return this.userRepository.save(user);
  }
}
