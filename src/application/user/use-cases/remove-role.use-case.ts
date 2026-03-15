import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/domain/user/entities/user.domain';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../core/domain/user/repositories/user.repository.interface';
import { UserNotFoundException } from '../../../core/domain/user/exceptions/user-not-found.exception';
import { UserRole } from '../../../core/shared/enums/user-role.enum';

@Injectable()
export class RemoveRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return this.userRepository.removeRole(id, role);
  }
}
