import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';

@Injectable()
export class UnsubscribeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);

    await this.userRepository.removeSubscription(userId, categoryId);
  }
}
