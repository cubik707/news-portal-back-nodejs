import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';

@Injectable()
export class UpdateUserFieldUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, fields: Record<string, unknown>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.updateProfile({
      username: fields['username'] as string | undefined,
      lastName: fields['lastName'] as string | undefined,
      firstName: fields['firstName'] as string | undefined,
      surname: fields['surname'] as string | undefined,
      position: fields['position'] as string | undefined,
      department: fields['department'] as string | undefined,
      avatarUrl: fields['avatarUrl'] as string | undefined,
    });

    return this.userRepository.update(id, user);
  }
}
