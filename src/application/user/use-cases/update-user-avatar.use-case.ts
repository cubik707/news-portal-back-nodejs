import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';

export interface UpdateUserAvatarInput {
  userId: string;
  avatarUrl?: string;
}

@Injectable()
export class UpdateUserAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateUserAvatarInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new UserNotFoundException(input.userId);

    user.updateProfile({ avatarUrl: input.avatarUrl });
    return this.userRepository.update(input.userId, user);
  }
}
