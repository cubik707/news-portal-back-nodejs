import { Inject, Injectable } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

@Injectable()
export class SubscribeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(userId: string, categoryId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new CategoryNotFoundException(categoryId);

    await this.userRepository.addSubscription(userId, categoryId);
  }
}
