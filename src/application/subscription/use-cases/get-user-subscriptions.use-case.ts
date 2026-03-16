import { Inject, Injectable } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { UserSubscriptionsDto } from '../../user/dtos/user-subscriptions.dto';
import { CategoryResponseDto } from '../../category/dtos/category-response.dto';

@Injectable()
export class GetUserSubscriptionsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserSubscriptionsDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException(userId);

    const categories = await this.userRepository.findSubscriptions(userId);

    const dto = new UserSubscriptionsDto();
    dto.userId = userId;
    dto.categories = categories.map(CategoryResponseDto.fromDomain);
    return dto;
  }
}
