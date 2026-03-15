import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../core/shared/ports/password-hasher.port';

export interface UpdateUserCommand {
  id: string;
  username: string;
  email: string;
  password?: string;
  lastName: string;
  firstName: string;
  surname?: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new UserNotFoundException(command.id);
    }

    user.changeEmail(new Email(command.email));
    user.updateProfile({
      username: command.username,
      lastName: command.lastName,
      firstName: command.firstName,
      surname: command.surname,
      position: command.position,
      department: command.department,
      avatarUrl: command.avatarUrl,
    });

    if (command.password) {
      const hash = await this.passwordHasher.hash(command.password);
      user.updatePasswordHash(PasswordHash.fromHash(hash));
    }

    return this.userRepository.update(command.id, user);
  }
}
