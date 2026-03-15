import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { Email } from '../../../core/shared/value-objects/email.vo';
import { PasswordHash } from '../../../core/shared/value-objects/password-hash.vo';

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
      const hash = await bcrypt.hash(command.password, 10);
      const updatedUser = User.reconstitute({
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: PasswordHash.fromHash(hash),
        isApproved: user.isApproved,
        roles: user.roles,
        createdAt: user.createdAt,
        lastName: user.lastName,
        firstName: user.firstName,
        surname: user.surname,
        position: user.position,
        department: user.department,
        avatarUrl: user.avatarUrl,
      });
      return this.userRepository.update(command.id, updatedUser);
    }

    return this.userRepository.update(command.id, user);
  }
}
